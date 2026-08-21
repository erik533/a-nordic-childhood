# First Numbers pilot launch runbook

This is a deliberately small pilot funnel beside the existing static site:

`landing page -> application -> review or result -> personal download -> feedback -> optional updates`

Supabase is the source of truth. Resend delivers operational email and stores only explicit marketing subscribers. Vercel hosts the pages, API functions, daily reminders, and daily retention job.

## Boundaries encoded in the funnel

- The pilot is English-only.
- Age is stored for analysis but never rejects a family.
- The first five accepted families are reviewed manually.
- The pilot pauses automatically after the fifth acceptance.
- Opening the remaining fifteen places requires an explicit operator confirmation.
- During wave two, clear fits are accepted automatically, unsure answers wait for review, and clear mismatches receive a respectful explanation.
- One adult email maps to one active application. A repeat returns the existing status and does not consume another place.
- One real activity attempt or a genuine printing failure confirms completion.
- A no-use response is saved without confirming the reward and can be updated through the three-day grace period.
- Pilot participation and marketing consent remain separate.
- Participant links contain a random token in the URL fragment. Supabase stores only its SHA-256 hash.

The seven-day period, three-day grace period, and evidence targets are still assumptions. Review them after the first five families.

## Configure Supabase

1. Keep `supabase/migrations/001_founding_families.sql` as production history.
2. Run `supabase/migrations/002_founding_families_revision.sql` once in the Supabase SQL editor.
3. Confirm `pilot_settings` contains `first_numbers_v1` with phase `first_wave`, first-wave cap `5`, and cohort cap `20`.
4. Keep the service-role key only in Vercel environment variables. Never expose it in browser code or commit it.

The second migration is additive. It preserves existing production rows while replacing the public application with one learning-stage field.

## Configure Resend

1. Keep the verified transactional sender in `RESEND_FROM`.
2. Create a First Numbers segment and a First Numbers topic in Resend.
3. Add their IDs as `RESEND_FIRST_NUMBERS_SEGMENT_ID` and `RESEND_FIRST_NUMBERS_TOPIC_ID`.
4. Make the topic use managed unsubscribe support.
5. Use `EMAIL_MODE=disabled` for synthetic preview testing. Use `EMAIL_MODE=live` only when a real test message is intended.

No participant is added to Resend Contacts by the application or feedback APIs. The separate marketing action is available only after completion-qualifying feedback.

## Configure Vercel

Set these variables for Preview first, then Production:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `PUBLIC_SITE_URL`
- `PILOT_SUPPORT_EMAIL`
- `PILOT_ADMIN_SECRET`
- `PILOT_ADMIN_PATH`
- `RESEND_FIRST_NUMBERS_SEGMENT_ID`
- `RESEND_FIRST_NUMBERS_TOPIC_ID`
- `EMAIL_MODE`
- `CRON_SECRET`

Use separate long random values for `PILOT_ADMIN_SECRET` and `CRON_SECRET`.

Preview email links automatically use Vercel's branch URL. Production links use `PUBLIC_SITE_URL`.

## Private review page

Open `/founding-families/review/` and enter `PILOT_ADMIN_SECRET`. The passphrase stays in page memory and is sent as a bearer token only to the server-side admin API.

The page supports:

- pending application decisions
- exact accepted, downloaded, completed, and delivery-failure counts
- safe resend of the failed message type
- explicit opening of wave two
- explicit final cohort closure, which starts the retention clock

Do not open wave two until every gate item is true. If three completions have not arrived, wait until the deadline and grace period end, diagnose the shortfall, then make the product decision explicitly.

## Verification

Run the automated suite:

`npm test`

The suite covers qualification, feedback outcomes, grace timing, reminder suppression, UTM filtering, admin authorization, staged capacity contracts, duplicate protection, and the no-em-dash copy rule.

On the Vercel preview:

1. Test `pending_review`, `accepted`, `waitlisted`, and `not_now` application results.
2. Confirm a duplicate email returns the existing status and does not add a place.
3. Accept and decline a pending application from the review page.
4. Test a failed operational message and its exact resend path.
5. Open the personal page with a valid, invalid, and missing token.
6. Download US Letter first, then A4, and confirm both events in Supabase.
7. Submit actual-use, printing-failure, and no-use feedback.
8. Update a no-use response during the grace period.
9. Confirm qualifying feedback stops reminders immediately.
10. Confirm marketing signup requires a separate click after qualifying feedback.
11. Check keyboard navigation, visible focus, required-field errors, and mobile layout.
12. Print one US Letter page and one A4 page at 100 percent or Actual Size.
13. Confirm the event chain in Supabase.
14. Delete every synthetic participant, feedback, token, event, and marketing record before recruitment.

## Recruitment sequence

Use `FIRST-WAVE-RECRUITMENT.md` for the source-specific organic invitations and UTM links. Do not run paid ads in wave one.

After five acceptances, use the private page to review the gate. Open wave two only after explicit approval. When recruitment and follow-up are finished, close the cohort from the same page so retention processing can begin.
