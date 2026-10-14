ALTER TABLE public.profiles ADD COLUMN is_private boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.can_see_photos(_owner uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _owner = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = _owner AND NOT is_private)
    OR EXISTS (SELECT 1 FROM public.follows WHERE follower_id = auth.uid() AND following_id = _owner)
$$;

DROP POLICY "read photos" ON public.profile_photos;
CREATE POLICY "read visible photos" ON public.profile_photos FOR SELECT TO authenticated USING (public.can_see_photos(user_id));
DROP POLICY "members view profile photos" ON storage.objects;
CREATE POLICY "members view visible profile photos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'profile-photos' AND public.can_see_photos(((storage.foldername(name))[1])::uuid));

CREATE OR REPLACE FUNCTION public.profile_directory()
RETURNS TABLE(id uuid, username text, display_name text, bio text, discoverable boolean, is_private boolean, followers bigint, following bigint)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT p.id, p.username, p.display_name, p.bio, p.discoverable, p.is_private,
    (SELECT count(*) FROM public.follows f WHERE f.following_id = p.id),
    (SELECT count(*) FROM public.follows f WHERE f.follower_id = p.id)
  FROM public.profiles p
$$;

CREATE TABLE public.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 3 AND 60),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','private')),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.group_members (
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active','pending')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.group_members TO authenticated;
GRANT ALL ON public.groups TO service_role;
GRANT ALL ON public.group_members TO service_role;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_group_owner(_group uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.groups WHERE id = _group AND owner_id = auth.uid())
$$;
CREATE OR REPLACE FUNCTION public.is_group_member(_group uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.group_members WHERE group_id = _group AND user_id = auth.uid() AND status = 'active')
$$;
CREATE OR REPLACE FUNCTION public.group_is_public(_group uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.groups WHERE id = _group AND visibility = 'public')
$$;

CREATE POLICY "members read groups" ON public.groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "create own group" ON public.groups FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "owner updates group" ON public.groups FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "owner deletes group" ON public.groups FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "read memberships" ON public.group_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_group_owner(group_id) OR (status = 'active' AND (public.group_is_public(group_id) OR public.is_group_member(group_id))));
CREATE POLICY "join as self" ON public.group_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "owner approves" ON public.group_members FOR UPDATE TO authenticated USING (public.is_group_owner(group_id)) WITH CHECK (public.is_group_owner(group_id));
CREATE POLICY "leave or remove" ON public.group_members FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_group_owner(group_id));

CREATE OR REPLACE FUNCTION public.set_membership_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.groups WHERE id = NEW.group_id AND owner_id = NEW.user_id) THEN
    NEW.role := 'owner'; NEW.status := 'active';
  ELSE
    NEW.role := 'member';
    NEW.status := CASE WHEN public.group_is_public(NEW.group_id) THEN 'active' ELSE 'pending' END;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER group_member_status BEFORE INSERT ON public.group_members FOR EACH ROW EXECUTE FUNCTION public.set_membership_status();

CREATE OR REPLACE FUNCTION public.add_group_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id) VALUES (NEW.id, NEW.owner_id);
  RETURN NEW;
END $$;
CREATE TRIGGER group_owner_member AFTER INSERT ON public.groups FOR EACH ROW EXECUTE FUNCTION public.add_group_owner();