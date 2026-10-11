# Yuni Connect

Build Yuni Circle, a production-oriented, mobile-first LGBTQ+ community platform that launches in Kenya and is architected to scale globally. Brand tagline: Connect. Belong. Thrive. The platform brings together community networking, optional dating, events, advocacy and rights, opportunities, and community funding. Build a polished responsive web app with a clean premium interface, warm white backgrounds, deep purple primary branding, restrained rainbow gradients, rounded cards, accessible typography, and simple navigation. Use the attached Yuni Circle logo if available; otherwise create a temporary text-based brand mark.

PRODUCT MODULES:
1. Authentication and onboarding: sign up, sign in, password reset, email verification, terms and privacy consent, display name, optional profile photo, country, language, interests, and granular visibility settings. Allow pseudonyms. Do not require users to disclose sexual orientation or gender identity. Make profile fields optional where possible.
2. Member community: editable profiles, interest-based groups, discussion posts, comments, reactions, member search based on opted-in discoverability, block/report, moderation queues, and private messaging with consent controls. Do not expose private member lists.
3. Optional dating: a separate opt-in dating area, age gating for adults, dating preferences, mutual likes and matches, consent-based chat, unmatch, block, report, and visibility controls. Never automatically place community members in dating. Do not create public maps or reveal exact location.
4. Events: event listings, category and country filters, organizer profiles, RSVP, capacity, waitlists, attendee privacy, cancellation, reminders, volunteer sign-ups, and private events with restricted venue details. Include virtual and in-person events.
5. Advocacy and rights: educational resources, campaigns, volunteer opportunities, verified support referrals, rights information with jurisdiction and last-reviewed date, and confidential requests for assistance. Clearly distinguish general information from legal advice.
6. Opportunities: jobs, scholarships, grants, courses, mentorship, volunteering, entrepreneurship resources, and business listings. Include search, filters, closing dates, application links, verification, and report-listing functionality.
7. Community funding: fundraising campaigns, donations, community projects, emergency mutual aid, grant applications, eligibility rules, funding goals, progress tracking, approval workflows, receipts where supported, and public financial summaries. Keep applicants' identities and sensitive evidence confidential. Never display unverified fundraising claims as verified. Do not store payment card details. Use a secure payment provider and test mode until payment credentials and compliance checks are configured.
8. Notifications: in-app notifications for messages, matches, events, applications, and relevant updates; user-controlled preferences; no sensitive lock-screen previews by default.
9. Administration: role-based dashboards for platform administrators, moderators, event organizers, opportunity reviewers, and finance reviewers. Include user reports, moderation actions, audit logs, campaign approval, donation reconciliation, grant decisions, content management, and analytics using aggregated data. No administrator should automatically receive unrestricted access to private messages or sensitive profile information.

DESIGN: Build a premium, welcoming, simple-to-use interface inspired by polished modern community apps. Use deep purple as the primary brand color, white and soft neutral surfaces, and small intentional rainbow accents. Use the tagline Connect. Belong. Thrive. Design a responsive home dashboard with a welcome section, community groups, upcoming events, featured opportunities, advocacy updates, and funding campaigns. Add a mobile bottom navigation for Home, Community, Discover, Events, and Profile, with accessible links to Dating, Opportunities, Rights, and Funding. Use realistic but clearly labelled demo data; do not imply demo events, people, grants, or donations are real. Provide loading, empty, success, validation, and error states. Meet WCAG accessibility principles, support keyboard navigation, and provide clear labels and contrast.

TECHNICAL ARCHITECTURE: Use Lovable's supported React, TypeScript, and Tailwind stack with reusable components. Use Supabase for authentication, PostgreSQL, storage, and server-side functions where appropriate. Create a normalized relational schema for profiles, privacy settings, groups, memberships, posts, comments, reactions, conversations, messages, dating preferences, likes, matches, blocks, reports, events, RSVPs, opportunities, applications, campaigns, donations, grants, notifications, audit logs, and moderation actions. Use appropriate foreign keys, timestamps, indexes, validation, and lifecycle states. Enforce authorization and ownership with Supabase Row Level Security on every sensitive table. Put privileged actions, secrets, payment webhooks, moderation decisions, and funding approvals on trusted server-side functions; never expose service-role keys in the browser. Add rate limits and abuse protections where feasible. Use private storage buckets and short-lived signed URLs for sensitive files. Do not log sensitive profile details or application evidence unnecessarily.

PRIVACY AND SAFETY: Treat sexual orientation, gender identity, dating activity, location, private messages, and assistance applications as highly sensitive. Collect the minimum data necessary. Provide consent, account deletion, data export where appropriate, profile visibility controls, retention rules, and incident-response procedures. Never sell personal data or use sensitive identity data for ad targeting. Do not expose members' identities to other members, donors, employers, or organizers without appropriate consent. Build clear safety reporting and escalation workflows. Plan for applicable Kenyan and international data protection and fundraising requirements. Ensure the product does not promise absolute anonymity or security.

INTERNATIONALIZATION: Launch with Kenya as the initial market but support international country selection, time zones, currencies, language expansion, localized dates, country-specific opportunity listings, and region-specific rights resources. Keep legal and support content jurisdiction-aware. Do not hard-code the product to Kenya.

IMPLEMENTATION APPROACH: First build the shared design system, responsive layout, navigation, authentication, database schema, and access controls. Then implement the community, events, opportunities, advocacy, dating, and funding modules. Use migrations and environment variables. Create seed data only for clearly marked demo content. Add useful automated tests for authentication, role permissions, privacy boundaries, reporting, matching, event registration, and funding workflows. Create an environment setup guide and document any external services that require credentials.

IMPORTANT: Build functioning end-to-end features, not just a static mockup. Do not fake successful payments, messages, registrations, or applications. If a service is not configured, show a clear setup state. Before deploying, verify database migrations, Row Level Security, access controls, server-side authorization, and critical privacy boundaries. Start by presenting the application structure and database plan, then implement in manageable stages without sacrificing a cohesive, working product.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7ff5b189-b37d-461e-be68-75fad818dc62).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
