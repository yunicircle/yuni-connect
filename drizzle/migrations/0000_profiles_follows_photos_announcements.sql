CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '' CHECK (char_length(bio) <= 300),
  discoverable boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.follows (
  follower_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);
CREATE INDEX follows_following_idx ON public.follows(following_id);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read follows" ON public.follows FOR SELECT TO authenticated USING (true);
CREATE POLICY "follow as self" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "unfollow as self" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

CREATE TABLE public.profile_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.profile_photos TO authenticated;
GRANT ALL ON public.profile_photos TO service_role;
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read photos" ON public.profile_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "add own photo" ON public.profile_photos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND path LIKE auth.uid()::text || '/%');
CREATE POLICY "delete own photo" ON public.profile_photos FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.enforce_photo_limit() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.profile_photos WHERE user_id = NEW.user_id) >= 5 THEN
    RAISE EXCEPTION 'You can upload up to 5 photos';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER profile_photo_limit BEFORE INSERT ON public.profile_photos FOR EACH ROW EXECUTE FUNCTION public.enforce_photo_limit();

CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read announcements" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins post announcements" ON public.announcements FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete announcements" ON public.announcements FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.profile_stats()
RETURNS TABLE (id uuid, username text, display_name text, bio text, discoverable boolean, followers bigint, following bigint)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT p.id, p.username, p.display_name, p.bio, p.discoverable,
    (SELECT count(*) FROM public.follows f WHERE f.following_id = p.id),
    (SELECT count(*) FROM public.follows f WHERE f.follower_id = p.id)
  FROM public.profiles p
$$;
GRANT EXECUTE ON FUNCTION public.profile_stats() TO authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE base text; candidate text; n int := 0;
BEGIN
  base := lower(regexp_replace(coalesce(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1), 'member'), '[^a-zA-Z0-9_]', '', 'g'));
  IF char_length(base) < 3 THEN base := base || 'member'; END IF;
  base := left(base, 20);
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) LOOP
    n := n + 1; candidate := base || n::text;
  END LOOP;
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (NEW.id, candidate, coalesce(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', candidate));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, username, display_name)
SELECT u.id, left(lower(regexp_replace(split_part(u.email,'@',1),'[^a-zA-Z0-9_]','','g')) || 'member', 20) || substr(u.id::text,1,4),
  split_part(u.email,'@',1)
FROM auth.users u ON CONFLICT DO NOTHING;

CREATE POLICY "members view profile photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'profile-photos');
CREATE POLICY "upload own profile photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "delete own profile photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);