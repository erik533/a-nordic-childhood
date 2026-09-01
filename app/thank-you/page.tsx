import { cookies } from 'next/headers';
import Link from 'next/link';
import { verifyDownloadClaim } from '@/lib/purchase';
import styles from './thank-you.module.css';

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const cookieStore = await cookies();
  const authorised = status !== 'problem' && verifyDownloadClaim(cookieStore.get('anc_download_access')?.value);

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>A NORDIC CHILDHOOD</p>
        {authorised ? (
          <>
            <h1>Your collection is ready.</h1>
            <p>Thank you. Your payment was received, and the complete printable collection is ready to download.</p>
            <a className={styles.button} href="/api/download">Download the complete collection</a>
            <small>The download is a ZIP file of approximately 216 MB. Please save it somewhere you can find again.</small>
          </>
        ) : (
          <>
            <h1>We could not confirm the download yet.</h1>
            <p>No second payment is needed. Please return to the Stripe confirmation page and use its link again, or email erik@erikastrand.com for help.</p>
          </>
        )}
        <Link className={styles.returnLink} href="/">Return to A Nordic Childhood</Link>
      </section>
    </main>
  );
}
