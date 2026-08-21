# Founding Families pilot — launch runbook

This is a deliberately small funnel added beside the existing static site:

`landing → qualification → accepted/waitlisted/not-now → private download → feedback → reward review`

Supabase is the source of truth. Resend only delivers operational email. Vercel hosts the pages, API functions, and one daily reminder job.

## Decisions currently encoded

- First round is English-only.
- The provisional target is a child who can count aloud but is not yet consistently matching, counting, or composing the target quantities.
- The accepted cohort defaults to 20; set `PILOT_COHORT_CAP` to change it.
- One adult email maps to one active application. Re-submitting returns the existing outcome and, if accepted, the same private link.
- Participants are asked to try two sittings within eight days. A real attempt plus a concrete report can qualify even when printing fails or the child stops early.
- Operational reminders are considered on day 2 (download), day 4 (session), and day 8 (feedback). Submitted or withdrawn participants receive none.
- The public repository contains no credentials. Participant URLs carry a random token in the URL fragment; the database lookup uses only its SHA-256 hash.

These are product assumptions, not measured facts. Review them after the first five usable reports.

## Configure Supabase

1. Create a project in an appropriate region.
2. Open the SQL editor and run `supabase/migrations/001_founding_families.sql` once.
3. Copy the project URL and **service role** key into Vercel. Never expose the service role key in browser code or commit it.
4. Use the Supabase table editor for pilot operations. `pilot_participants` is the cohort list, `pilot_events` is the funnel trail, and `pilot_feedback` contains reports.

## Configure Resend

1. Verify a sending subdomain such as `updates.erikastrand.com`.
2. Create an API key limited to sending email.
3. Set `RESEND_FROM` to a verified sender, for example `First Numbers <pilot@updates.erikastrand.com>`.
4. Keep `EMAIL_MODE=disabled` in a preview until the form and database path have been tested. Remove it or set it to `enabled` for the live pilot.

## Configure Vercel

Set all variables from `.env.example` for Preview first, then Production. Generate a long random value for `CRON_SECRET`. Vercel invokes `/api/reminders` daily using that secret.

Use the preview URL for the first full-path test. Set `PUBLIC_SITE_URL` to that exact preview origin during the test so email links return there; change it to the production domain before launch.

## Smoke test

1. Submit one clearly eligible application; confirm one participant and the expected funnel events appear.
2. Re-submit the same email; confirm the accepted count does not increase and the private link still works.
3. Download both paper formats; confirm each PDF opens and a download event appears.
4. Submit complete feedback; confirm `feedback_status=submitted`, `reward_status=review_pending`, and a feedback row exists.
5. Submit one too-advanced and one non-English application; confirm both route to `not_now` without exposing the reason in the browser.
6. Temporarily backdate a test participant and invoke the reminder endpoint with the cron bearer token; confirm the correct reminder and sent timestamp.
7. Test on a phone-sized viewport and print one real page at 100% / Actual Size.
8. Delete the test records before recruiting.

## Operator view for the first round

For the smallest launch, use Supabase tables rather than building an admin dashboard. A simple funnel can be counted from `pilot_events`: `landing_view`, `application_start`, `application_submit`, `qualified`, `accepted`, `download_view`, `pilot_download`, `feedback_start`, and `feedback_submit`.

Reward issuance is intentionally manual. After checking whether a report contains a real attempt and concrete evidence, update `feedback_status` and `reward_status`. Automation here would encode an untested quality rule too early.
