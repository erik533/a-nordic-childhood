import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import PagePreview from '../warm-hero/PagePreview';
import FirstLettersPageTracker from './FirstLettersPageTracker';
import FirstLettersPurchaseLink from './FirstLettersPurchaseLink';
import MobilePurchaseBar from './MobilePurchaseBar';
import PreviewGallery from './PreviewGallery';
import './first-letters.css';

export const metadata: Metadata = {
  title: 'First Letters & First Words | A Nordic Childhood',
  description: 'Three printable PDF books to help children meet letters, begin forming them, and use them in meaningful first words. First Letters, Words Together and Extra Letter Practice for $10.',
  alternates: { canonical: '/first-letters' },
  openGraph: {
    title: 'First Letters & First Words | A Nordic Childhood',
    description: 'Three printable PDF books for first letters, meaningful first words and optional extra practice. US $10 once.',
    images: [{ url: '/first-letters/hero-three-book-set.png', width: 1448, height: 1086 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'First Letters & First Words | A Nordic Childhood',
    description: 'Three printable PDF books for first letters, meaningful first words and optional extra practice. US $10 once.',
    images: ['/first-letters/hero-three-book-set.png'],
  },
};

const products = [
  {
    title: 'First Letters',
    subheading: 'Meet the letters',
    body: 'Notice uppercase and lowercase forms, listen for useful beginning sounds, find letters among others, follow their shapes, and make an independent attempt.',
    reassurance: 'Your child does not need to know the alphabet or read independently before beginning.',
    src: '/first-letters/first-letters-cover.png',
    alt: 'Cover of First Letters: See, Hear and Write A-Z',
    width: 1053,
    height: 1494,
  },
  {
    title: 'Words Together',
    subheading: 'Turn letters into words that mean something',
    body: 'Begin with a real thing, memory, idea or message your child wants to hold. Say it, listen for its sounds, build it, write it, then read it back.',
    reassurance: 'Independent reading is not required.',
    src: '/first-letters/words-together-cover.png',
    alt: 'Cover of Words Together: From First Words to Meaningful Writing',
    width: 2336,
    height: 3504,
  },
  {
    title: 'Extra Letter Practice',
    label: 'OPTIONAL PRACTICE',
    subheading: 'Practice only where it helps',
    body: 'Choose a letter your child has already met. Start with a finger path, trace while the guide is useful, let the guide fade, then copy and try.',
    reassurance: 'One calm page is enough.',
    src: '/first-letters/extra-letter-practice-cover.png',
    alt: 'Cover of Extra Letter Practice: Choose and Practise A-Z',
    width: 1024,
    height: 1536,
  },
] as const;

const faqs = [
  {
    question: 'Is this a physical product?',
    answer: 'No. You receive three printable PDF books as a digital download. Nothing is shipped.',
  },
  {
    question: 'What age is this for?',
    answer: 'First Letters and Extra Letter Practice are marked 3+. Words Together is marked 4+ and begins after the child has met print letters.',
  },
  {
    question: 'What does my child need to know before starting?',
    answer: 'First Letters can begin before your child knows the alphabet or reads independently. Words Together comes later, after your child has met print letters, but independent reading is still not required.',
  },
  {
    question: 'Do I need to print everything?',
    answer: 'No. Print the page that helps today. Extra Letter Practice is specifically designed so you can return to an individual letter when more practice is useful.',
  },
  {
    question: 'How much grown-up help is needed?',
    answer: 'A grown-up stays lightly involved, especially to say words aloud, offer a model or help with simple materials. The books are designed around giving only as much support as helps the child continue.',
  },
  {
    question: 'Is this a complete reading or phonics curriculum?',
    answer: 'No. First Letters is a calm starting point, not a complete phonics course. The set is designed to help children meet print letters and begin using them meaningfully.',
  },
] as const;

function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="fl-section-heading">
      <p className="fl-eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {children}
    </header>
  );
}

export default function FirstLettersPage() {
  return (
    <main className="first-letters-page" id="top">
      <FirstLettersPageTracker />

      <header className="fl-header">
        <Link className="fl-wordmark" href="/" aria-label="A Nordic Childhood home">
          A NORDIC CHILDHOOD
        </Link>
        <FirstLettersPurchaseLink className="fl-header-cta" placement="header">
          Get the 3-book set <span aria-hidden="true">·</span> $10
        </FirstLettersPurchaseLink>
      </header>

      <section className="fl-hero" aria-labelledby="fl-hero-title">
        <div className="fl-hero-copy">
          <p className="fl-eyebrow">A NORDIC CHILDHOOD · 3 PRINTABLE PDF BOOKS</p>
          <h1 id="fl-hero-title">From first letters to first meaningful words.</h1>
          <div className="fl-hero-image fl-hero-image-mobile">
            <Image
              src="/first-letters/hero-three-book-set.png"
              alt="Three A Nordic Childhood printable books presented together with a $10 offer badge"
              width={1448}
              height={1086}
              priority
              sizes="94vw"
            />
          </div>
          <p className="fl-hero-body">Help your child meet letters, form them, and turn them into words that matter.</p>
          <p className="fl-hero-price">US $10 once</p>
          <FirstLettersPurchaseLink className="fl-button" placement="hero" data-primary-cta="hero">
            Get the 3-book set
          </FirstLettersPurchaseLink>
          <p className="fl-reassurance"><span>Digital download</span> · <span>3 printable PDFs</span> · <span>One-time purchase</span></p>
          <a className="fl-inside-link" href="#see-inside">See what&apos;s inside <span aria-hidden="true">↓</span></a>
        </div>
        <div className="fl-hero-image fl-hero-image-desktop">
          <Image
            src="/first-letters/hero-three-book-set.png"
            alt="Three A Nordic Childhood printable books presented together with a $10 offer badge"
            width={1448}
            height={1086}
            priority
            sizes="(max-width: 1100px) 94vw, 56vw"
          />
        </div>
      </section>

      <section className="fl-products" aria-labelledby="fl-products-title">
        <SectionHeading eyebrow="WHAT YOU GET" title="Three books. One clear way forward.">
          <p>Start with letters. Let them become words. Add extra practice only where it helps.</p>
        </SectionHeading>
        <div className="fl-product-list">
          {products.map((product, index) => (
            <article className={`fl-product${index === 2 ? ' fl-product-support' : ''}`} key={product.title}>
              <div className="fl-product-cover">
                <Image src={product.src} alt={product.alt} width={product.width} height={product.height} sizes="(max-width: 720px) 76vw, 360px" />
              </div>
              <div className="fl-product-copy">
                {'label' in product && <p className="fl-small-label">{product.label}</p>}
                <h3>{product.title}</h3>
                <h4>{product.subheading}</h4>
                <p>{product.body}</p>
                <small>{product.reassurance}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="fl-flow" aria-labelledby="fl-flow-title">
        <SectionHeading eyebrow="HOW THEY WORK TOGETHER" title="Letters are the beginning, not the finish line.">
          <p>First Letters helps your child meet print letters. Words Together gives those letters somewhere to go. Extra Letter Practice gives your child more practice forming the letters they have met.</p>
        </SectionHeading>
        <div className="fl-flow-grid">
          <article className="fl-flow-step fl-flow-first">
            <p className="fl-flow-label">1. MEET A LETTER</p>
            <h3>See it. Hear it. Find it. Form it.</h3>
            <p>One letter page brings recognition, listening and formation together without turning the page into rows of repetition.</p>
            <PagePreview src="/first-letters/meet-a.png" alt="First Letters Meet A page" title="Meet A" trackingName="Meet A flow" />
          </article>
          <article className="fl-flow-step fl-flow-words">
            <p className="fl-flow-label">2. LET LETTERS BECOME A WORD</p>
            <h3>Say it. Hear it. Build it. Write it. Read it back.</h3>
            <p>Words Together starts with a word that means something, then helps the child carry it from voice to page.</p>
            <PagePreview src="/first-letters/from-voice-to-page.png" alt="Words Together From voice to page activity" title="From voice to page" trackingName="From voice to page flow" />
          </article>
          <article className="fl-flow-step fl-flow-practice">
            <p className="fl-flow-label">3. EXTRA LETTER PRACTICE</p>
            <h3>Trace. Let the guide fade. Copy. Try.</h3>
            <p>Choose a letter your child has already met. Start with a finger path, trace while the guide is useful, let the guide fade, then copy and try.</p>
            <PagePreview src="/first-letters/letter-a-practice.png" alt="Extra Letter Practice Letter A page" title="Letter A" trackingName="Letter A flow" />
          </article>
        </div>
      </section>

      <section className="fl-fades" aria-labelledby="fl-fades-title">
        <div className="fl-fades-copy">
          <p className="fl-eyebrow">A LITTLE HELP, THEN ROOM TO TRY</p>
          <h2 id="fl-fades-title">The guide is meant to disappear.</h2>
          <p>First, follow the larger pale path with a finger. Then trace with a little guidance. Finally, the guide disappears and there is room for an independent attempt.</p>
          <ol className="fl-stages">
            <li><strong>FOLLOW</strong><span>Begin with the larger shape and a finger.</span></li>
            <li><strong>TRACE</strong><span>Make the movement with a little guidance.</span></li>
            <li><strong>TRY</strong><span>Let the guide go and make an independent attempt.</span></li>
          </ol>
          <p className="fl-fades-close">Enough support to begin. Enough space to make the letter their own.</p>
        </div>
        <figure className="fl-fades-page">
          <PagePreview src="/first-letters/meet-a.png" alt="Meet A page showing Follow, Trace and Try stages" title="Follow, Trace, Try" trackingName="Follow Trace Try" />
        </figure>
      </section>

      <section className="fl-mid-purchase" aria-label="Purchase the three-book set">
        <div>
          <strong>First Letters + Words Together + Extra Letter Practice</strong>
          <small>Digital download · 3 printable PDFs</small>
        </div>
        <p>US $10 once</p>
        <FirstLettersPurchaseLink className="fl-button fl-button-light" placement="midpoint">Get the 3-book set</FirstLettersPurchaseLink>
      </section>

      <section className="fl-previews" id="see-inside" aria-labelledby="fl-previews-title">
        <SectionHeading eyebrow="SEE INSIDE" title="Look through the real pages before you decide.">
          <p>The previews below are actual pages from the books you receive.</p>
        </SectionHeading>
        <PreviewGallery />
      </section>

      <section className="fl-nordic" aria-labelledby="fl-nordic-title">
        <p className="fl-eyebrow">A NORDIC CHILDHOOD</p>
        <h2 id="fl-nordic-title">A quieter way to begin.</h2>
        <div className="fl-nordic-copy">
          <p>Learning does not have to mean filling every line or rushing toward the next milestone.</p>
          <p>These books make room to look, listen, try, use what matters, and come back when more practice is useful.</p>
        </div>
        <p className="fl-nordic-close">One useful page can be enough for today.</p>
      </section>

      <section className="fl-grownup" aria-labelledby="fl-grownup-title">
        <SectionHeading eyebrow="FOR THE GROWN-UP" title="Simple to use. Easy to take slowly.">
          <p>You do not need to turn your kitchen table into a classroom.</p>
        </SectionHeading>
        <div className="fl-grownup-grid">
          <article><span>01</span><h3>Print only what helps</h3><p>Choose the page that fits where your child is today. There is no need to print everything at once.</p></article>
          <article><span>02</span><h3>Use ordinary things</h3><p>A pencil or crayon, scrap paper, and occasionally simple materials such as paper strips or string are enough. No special kit is required.</p></article>
          <article><span>03</span><h3>Help without taking over</h3><p>Some days your child writes. Some days you build a word together. Sometimes you write down your child&apos;s exact words. The idea can still belong to the child.</p></article>
          <article><span>04</span><h3>Come back when you need it</h3><p>Keep the PDFs and return to a useful page later. Reprint a page, revisit a letter, or pick up where you left off.</p></article>
        </div>
      </section>

      <section className="fl-offer" id="purchase" aria-labelledby="fl-offer-title">
        <div className="fl-offer-covers" aria-label="The three printable books in the set">
          <Image src="/first-letters/words-together-cover.png" alt="Cover of Words Together" width={2336} height={3504} sizes="(max-width: 720px) 30vw, 240px" quality={85} />
          <Image src="/first-letters/first-letters-cover.png" alt="Cover of First Letters" width={1053} height={1494} sizes="(max-width: 720px) 30vw, 240px" quality={85} />
          <Image src="/first-letters/extra-letter-practice-cover.png" alt="Cover of Extra Letter Practice" width={1024} height={1536} sizes="(max-width: 720px) 30vw, 220px" quality={85} />
        </div>
        <div className="fl-offer-copy">
          <h2 id="fl-offer-title">Begin with letters. Let words follow.</h2>
          <p className="fl-offer-intro">Three printable PDF books for one simple starting point.</p>
          <p className="fl-small-label">YOU RECEIVE</p>
          <dl className="fl-offer-list">
            <div><dt>First Letters</dt><dd>See, Hear &amp; Write A-Z</dd></div>
            <div><dt>Words Together</dt><dd>From First Words to Meaningful Writing</dd></div>
            <div><dt>Extra Letter Practice</dt><dd>Choose &amp; Practise A-Z</dd></div>
          </dl>
          <p className="fl-offer-price">US $10 once</p>
          <FirstLettersPurchaseLink className="fl-button" placement="offer">Get the 3-book set</FirstLettersPurchaseLink>
          <p className="fl-reassurance"><span>Instant digital access</span> · <span>3 printable PDFs</span> · <span>One-time purchase</span></p>
          <p className="fl-offer-close">Print what you need. Come back anytime.</p>
        </div>
      </section>

      <section className="fl-faq" aria-labelledby="fl-faq-title">
        <SectionHeading eyebrow="QUESTIONS" title="A few things to know before you begin." />
        <div className="fl-faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0 ? true : undefined}>
              <summary><span>{faq.question}</span><i aria-hidden="true" /></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="fl-final" aria-labelledby="fl-final-title">
        <h2 id="fl-final-title">One useful page is enough to begin.</h2>
        <p>Start with the page that fits today. The rest can wait.</p>
        <p className="fl-product-line">First Letters · Words Together · Extra Letter Practice</p>
        <p className="fl-final-price">US $10</p>
        <FirstLettersPurchaseLink className="fl-button" placement="closing">Get the 3-book set</FirstLettersPurchaseLink>
        <p className="fl-reassurance">Digital download · 3 printable PDFs</p>
      </section>

      <footer className="fl-footer">
        <Link href="/" className="fl-footer-wordmark">A NORDIC CHILDHOOD</Link>
        <div>
          <p>Rooted in Nordic childhood. Made for families everywhere.</p>
          <Link href="/privacy">Privacy</Link>
          <Link href="/recover">Recover a purchase</Link>
        </div>
      </footer>

      <MobilePurchaseBar />
    </main>
  );
}
