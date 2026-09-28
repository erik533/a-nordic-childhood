# GHL checkout handoff: First Letters 3-book set

## Offer and integration

Preserve the approved `/first-letters` sales page, copy, layout and imagery. The displayed offer is **Only $10** for three US Half Letter printable PDF books: First Letters, Words Together and Extra Letter Practice. The price remains USD 10 as a one-time payment. It is a digital download, not a physical shipment or subscription. Purchase reassurance identifies the format as **US Half Letter**.

The production checkout belongs in a **GoHighLevel V2 Funnel**, with Stripe as its underlying processor. Any post-purchase one-click upsell also belongs inside GHL. This change creates neither a Vercel checkout nor a Vercel upsell.

Set `NEXT_PUBLIC_FIRST_LETTERS_CHECKOUT_URL` to the approved public HTTPS GHL order-step URL in Vercel Preview and Production as appropriate, then rebuild/redeploy. This public, build-time value must contain no credentials or personal information. There is no live GHL URL configured by this change.

`lib/first-letters-offer.ts` owns the destination. All six CTA placements (header, hero, mobile sticky, midpoint, offer and closing) use `FirstLettersPurchaseLink.tsx`, including the compact mobile “Get them” link. Missing, invalid, non-HTTPS or credential-bearing configuration falls back to `#purchase`. It does not create an order. **Do not reuse `NEXT_PUBLIC_CHECKOUT_URL`**: that existing variable is for the separate $29 collection and remains unchanged.

## Attribution and privacy

`lib/checkout-attribution.ts` appends only the five supported UTMs: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`. Valid incoming values override destination defaults, preserving case and internal spaces. Destination settings and fragments otherwise survive.

Campaign values must be non-personal labels: 1–128 ASCII letters, numbers, spaces, dots, underscores or hyphens, starting with a letter or number. Email-like, URL-like, control-character and oversized values are excluded. Arbitrary incoming fields, including name, email, phone, contact IDs and redirects, are never forwarded. The allowlist is not a personal-data classifier: campaign authors must never place personal data in UTM labels.

`fbclid` is the only currently supported ad click identifier. It is forwarded unchanged only with explicit existing Meta consent (`anc_meta_consent=granted`) and no Global Privacy Control signal. Storage failures omit it. Allowed values contain 1–250 ASCII letters, numbers, dots, underscores or hyphens. Without consent it is removed even if accidentally present in the configured destination. No new cookies, identifiers, contact fields or persistent attribution store are introduced.

The real link href is populated after hydration and refreshed for normal, keyboard, middle-click and context-menu interactions. Analytics failure does not block navigation. Existing normalized analytics campaign keys are separate and unchanged. Only the current page URL is used, not earlier visits. Without JavaScript, the configured checkout still opens, but incoming attribution is not appended.

GHL must capture the forwarded fields at the order step and retain them through its native purchase/upsell flow. Cross-domain consent, order attribution, purchase-event deduplication and delivery configuration need verification in GHL; this repository cannot establish those settings.

## Visual source of truth

Use `app/first-letters/first-letters.css` plus the inherited font rules in `app/globals.css`. System fonts only, no font download:

- Headlines: Georgia, 'Times New Roman', serif, regular weight, letter spacing -0.035em, approximately 1.1 line-height.
- Body and buttons: Arial, Helvetica, sans-serif. Body 17px at desktop and mobile, line-height 1.6. Editorial introductions, prices and selected supporting copy use Georgia.
- Supporting readable purchase copy: 16px with 1.6 line-height and 20px above the reassurance. Do not compress it to fit a fixed-height box.
- Hero headline: clamp(48px, 4.7vw, 76px), with the existing mobile override. Section headlines: clamp(42px, 4.7vw, 70px). Keep the hierarchy and generous whitespace, not identical checkout section heights.

| Token | Value | Use |
| --- | --- | --- |
| `--fl-paper` | `#f7f3eb` | Main parchment |
| `--fl-paper-deep` | `#eee7db` | Deeper warm section |
| `--fl-cream` | `#fcfaf5` | Light surfaces |
| `--fl-ink` | `#253129` | Main text |
| `--fl-forest` | `#2f493b` | Dark green |
| `--fl-sage` | `#7b8f7c` | Muted green |
| `--fl-berry` | `#a94732` | Primary CTA |
| `--fl-berry-dark` | `#873525` | CTA hover |
| `--fl-ochre` | `#bd8c2f` | Accent/focus |
| `--fl-line` | `rgba(48,65,53,.18)` | Restrained borders |

Primary CTA: warm berry, light text, 14px radius, minimum 54px height (hero 58px), generous horizontal padding. Keyboard focus: 3px ochre outline, 4px offset. Final price has 32px space above and 24px below. Match the quiet editorial appearance, warm paper, serif/sans contrast and readable reassurance. Avoid dense cards, cramped price/button groups or new promotional claims.

## Approved $10 imagery

Use these existing files, without generating replacement covers or artwork:

| Repository path under `public/first-letters/` | Size | Role |
| --- | --- | --- |
| `hero-three-book-set-clean-price.png` | 1448 × 1086 | Current $10 three-book hero, with the stray underline beneath the 1 removed |
| `first-letters-cover.png` | 1053 × 1494 | First Letters |
| `words-together-cover.png` | 2336 × 3504 | Words Together |
| `extra-letter-practice-cover.png` | 1024 × 1536 | Extra Letter Practice |

The original supplied `hero-three-book-set.png` is retained as a source/rollback asset. The corrected hero was made with the built-in image editor using the instruction: remove only the short white underline beneath the 1 in the $10 badge; preserve the price, caption, book covers and composition.

The offer cover composition places **First Letters in front**, Words Together on the left, Extra Letter Practice on the right. Keep cover proportions and titles legible. Do not use imagery for the $29 collection.

Actual page previews, each 1343 × 1905: `meet-a.png`, `letters-in-my-name.png`, `from-voice-to-page.png`, `what-do-your-words-need-to-do.png`, `letter-a-practice.png`, `choose-and-practise.png`. These are preview images, not the customer PDF deliverables.

## Remaining launch dependencies

1. Configure the $10 three-PDF product, Stripe connection and order step in GHL. Supply the approved HTTPS URL.
2. Configure customer PDF delivery and any native one-click upsell entirely in GHL. No upsell copy, product, price or step is specified or implemented here.
3. Set the dedicated environment variable, rebuild, then verify all six CTAs on the Vercel preview, including mobile and open-in-new-tab.
4. Test a GHL order with UTMs, consent allowed/denied and GPC. Confirm the correct $10 offer, captured attribution, delivery and any GHL-owned purchase events before going live. Tax treatment and final charged total require confirmation in the checkout configuration.
