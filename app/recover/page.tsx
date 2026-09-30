import Link from 'next/link';
import styles from './recover.module.css';

export default async function RecoverPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>A NORDIC CHILDHOOD</p>
        <h1>Recover your collection.</h1>
        <p>Use the email address from checkout and the receipt number in your Stripe receipt. We will restore the download on this device.</p>

        {status === 'not-found' ? (
          <p className={styles.notice} role="alert">We could not match those details. Check the receipt number and checkout email, or email <a href="mailto:erik@erikastrand.com">erik@erikastrand.com</a>.</p>
        ) : null}
        {status === 'problem' ? (
          <p className={styles.notice} role="alert">Recovery is temporarily unavailable. Please email <a href="mailto:erik@erikastrand.com">erik@erikastrand.com</a> and no second payment will be needed.</p>
        ) : null}

        <form className={styles.form} action="/api/recover" method="post">
          <label htmlFor="email">Checkout email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />

          <label htmlFor="receipt">Stripe receipt number</label>
          <input id="receipt" name="receipt" type="text" autoCapitalize="characters" autoComplete="off" placeholder="For example, 1234-5678" required />

          <div className={styles.trap} hidden aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <button type="submit">Restore my download</button>
        </form>

        <p className={styles.help}>Stripe includes the receipt number near the top of the emailed receipt. These details are used only to verify this purchase.</p>
        <nav className={styles.links} aria-label="Purchase recovery links">
          <Link href="/">Return to A Nordic Childhood</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </section>
    </main>
  );
}
