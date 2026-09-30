import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './privacy.module.css';

export const metadata: Metadata = {
  title: 'Privacy | A Nordic Childhood',
  description: 'How A Nordic Childhood handles website analytics, payments, and protected digital delivery.',
};

const sections = [
  ['responsible', 'Who is responsible'],
  ['information', 'Information we handle'],
  ['analytics', 'Analytics and ad measurement'],
  ['cookie', 'Cookies and your choice'],
  ['providers', 'Service providers'],
  ['retention', 'How long information is kept'],
  ['rights', 'Your rights'],
] as const;

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/" aria-label="A Nordic Childhood home">
          <span aria-hidden="true">✣</span>
          <strong>A NORDIC CHILDHOOD</strong>
        </Link>
        <Link className={styles.backLink} href="/">Return to the collection</Link>
      </header>

      <main>
        <section className={styles.introduction}>
          <div>
            <h1>Privacy, kept small.</h1>
            <p className={styles.updated}>Last updated 9 September 2026</p>
          </div>
          <p className={styles.lede}>
            This notice explains how A Nordic Childhood handles information when you visit the site,
            purchase the digital collection, and access the protected download.
          </p>
        </section>

        <section className={styles.promise} aria-label="Privacy summary">
          <strong>Advertising measurement is optional. Payment and delivery stay private.</strong>
          <p>Meta measurement loads only after you allow it. You can change that choice at any time.</p>
        </section>

        <div className={styles.contentLayout}>
          <nav className={styles.contents} aria-label="Privacy notice sections">
            <p>On this page</p>
            <ol>
              {sections.map(([id, label]) => (
                <li key={id}><a href={`#${id}`}>{label}</a></li>
              ))}
            </ol>
          </nav>

          <article className={styles.article}>
            <section id="responsible">
              <h2>Who is responsible</h2>
              <p>
                The data controller is <strong>Erik Astrand, sole proprietor trading as MalmaMedia, Sweden</strong>.
                A Nordic Childhood is the project name. Privacy questions and requests can be sent to{' '}
                <a href="mailto:erik@erikastrand.com">erik@erikastrand.com</a>.
              </p>
            </section>

            <section id="information">
              <h2>Information we handle</h2>
              <h3>When you visit</h3>
              <p>
                We receive aggregate information about visits, page views, referring sites, broad location,
                browser, device, and selected actions on the site. The analytics setup is described below.
              </p>
              <h3>When you purchase</h3>
              <p>
                Stripe receives the details you enter at checkout and provides us with the transaction record
                needed to confirm payment, deliver the collection, provide support, meet accounting obligations,
                and handle disputes. We do not receive or store your complete card number.
              </p>
              <h3>When you download</h3>
              <p>
                After Stripe confirms the exact paid product, the site issues a signed access claim in a secure
                cookie. A successful download-access event is counted without sending the Stripe session,
                download claim, email address, or file URL to analytics.
              </p>
              <h3>When you recover a purchase</h3>
              <p>
                If you use purchase recovery, the site sends the checkout email and Stripe receipt number directly
                to Stripe to match a completed purchase of this collection. We do not save either entry in a separate
                customer database or send it to analytics. A successful match restores the same secure download cookie.
              </p>
              <p>This website and checkout are intended for adults. We do not ask children to submit personal information.</p>
            </section>

            <section id="analytics">
              <h2>Analytics and advertising measurement</h2>
              <p>
                We use Vercel Web Analytics to understand aggregate visits, page views, referring sites, and
                three actions: checkout clicks, verified purchase returns, and successful download access.
                Vercel Web Analytics does not use analytics cookies. It uses a daily-reset visitor hash to
                produce aggregate statistics rather than a persistent cross-site identity.
              </p>
              <p>
                We do not send names, email addresses, payment details, Stripe identifiers, download tokens,
                free-text responses, or full query strings as analytics event data. Campaign measurement is
                limited to controlled, non-personal values for <code>utm_source</code>, <code>utm_medium</code>,
                and <code>utm_campaign</code>. Other query parameters are removed before analytics reporting.
              </p>
              <p>
                We use these aggregate statistics for our legitimate interest in understanding whether the site
                works and where it can be improved. You can read more in{' '}
                <a href="https://vercel.com/docs/analytics/privacy-policy" rel="noreferrer" target="_blank">Vercel&apos;s analytics privacy documentation</a>.
              </p>
              <h3>Optional Meta advertising measurement</h3>
              <p>
                If you select <strong>Allow measurement</strong>, the site loads the Meta Pixel. It reports page
                visits, checkout starts, and verified purchases to Meta, including the collection name, currency,
                and price. Meta may connect those events with information from your browser or Meta account to
                measure ads and help show them to people more likely to be interested.
              </p>
              <p>
                We do not send payment details, Stripe session identifiers, download tokens, or the purchaser&apos;s
                email address through the pixel. The legal basis is your consent. If you decline, the pixel does
                not load and purchasing still works normally.
              </p>
            </section>

            <section id="cookie">
              <h2>Cookies and your choice</h2>
              <p>
                After a verified purchase, the site sets one first-party cookie named <code>anc_download_access</code>.
                It is secure, HttpOnly, limited to this site, and expires after seven days. It is used solely to
                grant access to the protected digital download. It is not used for advertising or analytics.
              </p>
              <p>
                Because this cookie is necessary to provide the protected download you requested, the site does
                not ask for consent before setting it. Blocking or deleting it prevents the site from authorising
                the download until you return through Stripe&apos;s confirmation link or recover the purchase using
                the checkout email and receipt number.
              </p>
              <p>
                If you allow Meta measurement, Meta may set advertising cookies such as <code>_fbp</code> and
                <code>_fbc</code>. Use the <strong>Privacy choices</strong> button on the site to withdraw consent.
                Withdrawing stops future Meta events from this site and removes those first-party Meta cookies
                where the browser permits it.
              </p>
            </section>

            <section id="providers">
              <h2>Service providers</h2>
              <dl className={styles.providers}>
                <div>
                  <dt>Vercel</dt>
                  <dd>Hosts the website and private digital file, runs the purchase-verification routes, and provides privacy-focused aggregate analytics.</dd>
                </div>
                <div>
                  <dt>Stripe</dt>
                  <dd>Processes checkout and payment information and provides the payment record used to authorise delivery.</dd>
                </div>
                <div>
                  <dt>Meta</dt>
                  <dd>Receives advertising-measurement events only when you allow them, for ad attribution and delivery optimization.</dd>
                </div>
              </dl>
              <p>
                These providers may process information outside the EU or EEA, including in the United States.
                Where required, recognized transfer safeguards are used. Their own notices provide more detail:
                {' '}<a href="https://vercel.com/legal/privacy-policy" rel="noreferrer" target="_blank">Vercel Privacy Notice</a>
                {', '}<a href="https://stripe.com/privacy" rel="noreferrer" target="_blank">Stripe Privacy Policy</a>
                {' '}and{' '}<a href="https://www.facebook.com/privacy/policy/" rel="noreferrer" target="_blank">Meta Privacy Policy</a>.
              </p>
            </section>

            <section id="retention">
              <h2>How long information is kept</h2>
              <ul>
                <li>The protected-download cookie expires after seven days.</li>
                <li>Purchase-recovery entries are checked against Stripe during the request and are not retained by this website afterward.</li>
                <li>Your Meta measurement choice stays in this browser until you change it or clear site storage.</li>
                <li>Our current Vercel analytics reporting window is twelve months.</li>
                <li>Payment and transaction records are kept as long as required for accounting, tax, fraud prevention, support, and legal claims.</li>
                <li>Vercel and Stripe retain information according to their agreements and privacy notices.</li>
              </ul>
            </section>

            <section id="rights">
              <h2>Your rights</h2>
              <p>
                Depending on the circumstances, you may ask for access, correction, deletion, restriction, or a
                portable copy of your personal information. You may also object to processing based on legitimate
                interests. Some information must still be kept when the law requires it.
              </p>
              <p>
                To exercise a right, email <a href="mailto:erik@erikastrand.com">erik@erikastrand.com</a>.
                You may also lodge a complaint with the{' '}
                <a href="https://www.imy.se/en/individuals/data-protection/your-rights-as-a-data-subject/" rel="noreferrer" target="_blank">
                  Swedish Authority for Privacy Protection
                </a>.
              </p>
            </section>
          </article>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2026 Erik Astrand, MalmaMedia</p>
        <a href="mailto:erik@erikastrand.com">Contact</a>
      </footer>
    </div>
  );
}
