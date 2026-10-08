import { cookies } from 'next/headers';
import Link from 'next/link';
import { safeCampaignKey } from '@/lib/analytics';
import { verifyDownloadClaim } from '@/lib/purchase';
import PurchaseAnalytics from './PurchaseAnalytics';
import styles from './thank-you.module.css';

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ campaign?: string; purchase?: string; status?: string }> }) {
  const { campaign, purchase, status } = await searchParams;
  const cookieStore = await cookies();
  const authorised = status !== 'problem' && verifyDownloadClaim(cookieStore.get('anc_download_access')?.value);
  const recordPurchase = authorised && purchase === 'verified';

  return (
    <main className={styles.page}>
      {recordPurchase ? <PurchaseAnalytics campaign={safeCampaignKey(campaign)} /> : null}
      <section className={styles.card}>
        <p className={styles.eyebrow}>A NORDIC CHILDHOOD</p>
        {authorised ? (
          <>
            <h1>Your collection is ready.</h1>
            <p>Thank you. Your payment was received, and the complete printable collection is ready to download.</p>
            <a className={styles.button} href="/api/download">Download the complete collection</a>
            <small>The download is a ZIP file of approximately 216 MB. Please save it somewhere you can find again.</small>
            <p className={styles.recovery}>Need the files on another device later? <Link href="/recover">Recover your purchase</Link> using the email and receipt number Stripe sends you.</p>
          </>
        ) : (
          <>
            <h1>Your files have moved.</h1>
            <p>A Nordic Childhood now lives at ANordicChildhood.com. If you bought the books, I have emailed you new download links that work on any device. Cannot find the email? Write to erik@erikastrand.com and I will send your files again.</p>
          </>
        )}
        <nav className={styles.links} aria-label="Thank-you page links">
          <a href="https://anordicchildhood.com/">Go to ANordicChildhood.com</a>
          <Link href="/recover">Recover a purchase</Link>
        </nav>
      </section>
    </main>
  );
}
