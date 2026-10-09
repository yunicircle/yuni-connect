# Yuni Circle — Application Structure and Build Plan

Connect. Belong. Thrive. A mobile-first, privacy-first LGBTQ+ community platform. It launches in Kenya and is built to work in any country.

No logo file was attached, so the first version uses a text brand mark ("Yuni Circle" with a small rainbow ring). You can swap in the real logo later.

## Design direction
- Warm white background, deep purple brand color, soft neutral cards, large rounded corners.
- Rainbow used sparingly: a thin gradient line, the ring in the logo, progress bars.
- Headings in Fraunces (a warm serif) and body text in Figtree. Readable sizes, AA contrast, visible focus rings.
- Mobile bottom bar: Home, Community, Discover, Events, Profile. "Discover" links to Dating, Opportunities, Rights and Funding. On desktop this becomes a side menu.
- Every list has loading, empty, error and success states. Every piece of demo content carries a "Demo" badge.

## Pages
```text
/                 Public welcome page (sign in / join)
/auth             Sign in, sign up, forgot password
/reset-password   Set a new password
/onboarding       Consent > name/pseudonym > country/language > interests > visibility
/home             Dashboard: welcome, groups, events, opportunities, advocacy, funding
/community        Groups, feed, group detail, post + comments + reactions
/members          Search members who chose to be discoverable
/messages         Conversations (message requests need consent)
/discover         Hub for Dating, Opportunities, Rights, Funding
/dating           Opt-in, 18+ check, preferences, browse, matches, chat
/events           List + filters, detail, RSVP/waitlist, volunteer, organizer
/opportunities    Jobs, scholarships, grants, courses, mentorship, businesses
/rights           Resources by country, campaigns, support referrals, confidential help
/funding          Campaigns, donate, mutual aid, grant applications, public summaries
/notifications    Inbox + preferences
/profile          Profile, privacy, data export, delete account
/admin/*          Dashboards by role: reports, moderation, events, opportunities, finance, audit
```

## Database plan (Lovable Cloud)
- **Identity and privacy:** profiles, privacy_settings (per-field visibility), user_roles (a separate table), interests, profile_interests, countries, blocks
- **Community:** groups, group_memberships, posts, comments, reactions
- **Messaging:** conversations, conversation_participants (with a request/accepted state), messages
- **Dating (separate, opt-in):** dating_profiles (18+ confirmed, active flag), dating_preferences, dating_likes, dating_matches (an unmatch ends the chat)
- **Events:** organizers, events (public/private, virtual/in-person, capacity, status), event_rsvps (going/waitlist/cancelled, hide-me flag), event_volunteers
- **Advocacy:** rights_resources (country, last-reviewed date, "general info, not legal advice"), campaigns_advocacy, support_referrals (verified flag), assistance_requests (private)
- **Opportunities:** opportunities (type, country, closes_at, verified, status), opportunity_reports
- **Funding:** fund_campaigns (draft > pending > approved > closed, verified flag), donations (provider reference only, no card data), grant_programs, grant_applications (private), stored in a private bucket for evidence files
- **Safety and admin:** reports, moderation_actions, audit_logs, notifications, notification_preferences

## Privacy and access rules
- Row-level security on every table. People can only see their own private data.
- Member search only shows people who turned on "discoverable".
- Admin roles never get automatic access to private messages, dating activity or assistance and grant evidence. Reviewers only see the specific case assigned to them, and every view is logged.
- Blocking hides content in both directions.
- Moderation decisions, funding approvals, payment webhooks and role changes happen only on the server.
- Sensitive files live in private storage and open through links that expire quickly.
- Simple rate limits on posts, messages, likes and reports. These limits are enforced in the database.
- Account deletion, data export, and a plain-language privacy and safety page. The page explains how incidents are handled and does not promise absolute anonymity.

## Payments
Donations stay in clear "test mode / not configured" mode until a payment provider is connected. The app never shows a payment as successful unless the provider confirms it. Stripe or Paddle gets set up in a later stage, after you confirm where the organisation is registered.

## Build stages
1. Design system, layout, navigation, text logo, sign-up/sign-in/reset, onboarding, profiles and privacy, roles, the full database with access rules, and clearly marked demo content.
2. Community: groups, posts, comments, reactions, member search, messaging with consent, block and report.
3. Events and Opportunities.
4. Rights and advocacy, plus confidential help requests.
5. Dating (opt-in).
6. Funding and grants, plus the payment provider setup.
7. Notifications, admin dashboards, audit log and summary analytics.
8. Tests (sign-in, role permissions, privacy boundaries, reporting, matching, RSVP/waitlist, funding approvals) and a setup guide.

Each stage ends working before the next one starts.

## Technical notes
- TanStack Start + Lovable Cloud. Server functions use auth middleware, and pages that need sign-in sit under `_authenticated`.
- Countries, currency, time zone and language come from settings, with Kenya (KES, Africa/Nairobi, English/Swahili) as the default. Nothing is hard-coded to Kenya.
- Dates and amounts are formatted with `Intl`. Interface text sits in a translation dictionary so more languages can be added.
- Roles: admin, moderator, organizer, opportunity_reviewer, finance_reviewer. They are checked through a `has_role` security-definer function.
