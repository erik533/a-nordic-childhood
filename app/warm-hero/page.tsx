import Link from 'next/link';
import Image from 'next/image';
import './warm-hero.css';
import CheckoutLink from './CheckoutLink';
import PagePreview from './PagePreview';

const progression = [
  {
    step: '01',
    eyebrow: 'SEE IT',
    title: 'Meet the idea before the symbol',
    copy: 'A number begins as something the child can see, make, move, and compare. The written numeral comes when it has something to mean.',
    image: '/progression-number-five-hires.png',
    alt: 'First Numbers page showing five in a row and five in a new arrangement',
    tone: 'ochre',
  },
  {
    step: '02',
    eyebrow: 'HEAR AND FORM IT',
    title: 'Let the support gently disappear',
    copy: 'See the letter. Hear a useful sound. Follow the movement with a finger, trace once, then make an attempt without the path.',
    image: '/progression-letter-a-hires.png',
    alt: 'First Letters page introducing uppercase and lowercase A',
    tone: 'berry',
  },
  {
    step: '03',
    eyebrow: 'MAKE IT MATTER',
    title: 'Early writing can do something real',
    copy: 'A first word can name something. A caption can preserve a moment. A message can reach another person. Neatness can come later.',
    image: '/progression-words-keepsake-hires.png',
    alt: 'Words Together keepsake page titled My words in the world',
    tone: 'slate',
  },
];

const researchNotes = [
  {
    number: '1',
    authors: 'Li, J. X., and James, K. H.',
    title: 'Handwriting Generates Variable Visual Input to Facilitate Symbol Learning',
    publication: 'Journal of Experimental Psychology: General, 2016.',
    href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4755885/',
  },
  {
    number: '2',
    authors: 'James, K. H., and Engelhardt, L.',
    title: 'The Effects of Handwriting Experience on Functional Brain Development in Pre-literate Children',
    publication: 'Trends in Neuroscience and Education, 2012.',
    href: 'https://pubmed.ncbi.nlm.nih.gov/25541600/',
  },
  {
    number: '3',
    authors: 'What Works Clearinghouse.',
    title: 'Teaching Math to Young Children',
    publication: 'Institute of Education Sciences, 2013.',
    href: 'https://ies.ed.gov/ncee/wwc/PracticeGuide/18',
  },
];

const faqs = [
  {
    question: 'Where should we begin?',
    answer: <>
      <p>Begin with what your child is already noticing.</p>
      <p>If they are counting fingers, stones, or steps, try an early number page. If they are asking about a letter in their name, begin there. If they want to make a sign, label a drawing, or write something to another person, open <i>Words Together</i>.</p>
      <p>The collection provides paths, but you do not have to follow every page in order.</p>
    </>,
  },
  {
    question: 'What age is the collection for?',
    answer: <>
      <p>Some early number and letter pages can be shared from around age three through looking, listening, counting, movement, and finger-following. Pencil work can wait.</p>
      <p>The later books become useful as the child begins comparing quantities, recognising letters, making words, or wanting writing to carry a message.</p>
      <p>These are entry points, not deadlines. Choose by readiness and interest rather than trying to match every page to an age.</p>
    </>,
  },
  {
    question: 'Does my child need to read or write already?',
    answer: <>
      <p>No.</p>
      <p>The earliest pages begin with looking, listening, pointing, speaking, moving objects, drawing, and following a path with a finger. Independent letters, numerals, words, and messages come later.</p>
    </>,
  },
  {
    question: 'Do I need to print everything?',
    answer: <>
      <p>No. Please do not treat 313 pages as an instruction to print 313 pages.</p>
      <p>Use the PDF bookmarks and page ranges to find what fits today. Print one page or a short group. Leave the rest in the collection until it becomes useful.</p>
    </>,
  },
  {
    question: 'How much grown-up help is needed?',
    answer: <>
      <p>A younger child will need help choosing a page, understanding the short instruction, and getting started. Many pages use only a pencil, crayons, fingers, movement, or a few ordinary objects.</p>
      <p>Some children may continue independently once they understand the page. Others will want you nearby. The collection does not promise that every page will hold every child without help.</p>
    </>,
  },
  {
    question: 'What if the first page does not interest my child?',
    answer: <>
      <p>Leave it.</p>
      <p>One page cannot tell you how your child will respond to the rest of the collection. A child who ignores a number page may be interested in a letter from their name, a picture to label, a feeling to talk about, or a place to draw something entirely their own.</p>
      <p>There is no need to finish a page simply because it was printed.</p>
    </>,
  },
  {
    question: 'Is this a complete curriculum?',
    answer: <>
      <p>No. It is a home learning collection and supplement.</p>
      <p>It can support early numbers, letters, writing, observation, reflection, and conversation, but it does not replace school, a complete homeschool curriculum, specialist assessment, or individual support.</p>
    </>,
  },
  {
    question: 'Is it only for Nordic families?',
    answer: <>
      <p>No.</p>
      <p>Nordic words, landscapes, and ideas give the collection its character. Nature, feelings, courage, enoughness, numbers, letters, and meaningful writing belong to children everywhere.</p>
    </>,
  },
  {
    question: 'Can more than one child use it?',
    answer: <>
      <p>Yes. Personal household use includes the children in your household, and you may print pages again for them.</p>
      <p>The files may not be shared, uploaded, resold, or distributed outside your household.</p>
    </>,
  },
];

function WorkbookCover({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`warm-map-workbook ${className}`.trim()}>
      <span className="warm-map-wire" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => <i key={index} />)}
      </span>
      <PagePreview src={src} alt={alt} title={alt.replace('Cover of ', '')} kind="cover" />
    </div>
  );
}

/*
THESIS: Preserve the original hero and remove the visual container around the collection artwork.
OWN-WORLD: The established cream, forest, sage, and ochre palette with Georgia display type and a softer action.
STORY: The visitor reads the promise first, understands the collection, then sees the real covers across the same open field.
FIRST VIEWPORT: Copy remains on the left. The collection becomes a full-width background composition anchored to the right.
FORM: A restrained refinement of the original sales-page hero, directed by the user's correction.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
*/

export default function HeroBackgroundTest() {
  const checkoutUrl = process.env.NEXT_PUBLIC_CHECKOUT_URL || 'https://buy.stripe.com/aFa9AV1rn95u7eP6UIbfO02';

  return (
    <main className="hero-test" id="top">
      <nav className="test-nav" aria-label="Main navigation">
        <a className="test-wordmark" href="#top" aria-label="A Nordic Childhood home">
          <span className="test-mark" aria-hidden="true">✣</span>
          <span>A NORDIC CHILDHOOD</span>
        </a>
        <div className="test-links" aria-label="Page sections">
          <a href="#nordic">Why Nordic</a>
          <a href="#pages">See the pages</a>
          <a href="#keepsakes">Keepsakes</a>
        </div>
      </nav>

      <section className="background-hero" aria-labelledby="background-title">
        <div className="cover-background" role="img" aria-label="The five books in A Nordic Childhood: The Learning Collection">
          <div className="cover-object workbook cover-first-numbers">
            <span className="wire-binding" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</span>
            <Image src="/hero-cover-first-numbers.png" alt="" width={480} height={682} sizes="(max-width: 720px) 30vw, 220px" loading="eager" />
          </div>
          <div className="cover-object workbook cover-numbers-together">
            <span className="wire-binding" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</span>
            <Image src="/hero-cover-numbers-together.png" alt="" width={480} height={682} sizes="(max-width: 720px) 30vw, 220px" loading="eager" />
          </div>
          <div className="cover-object hardback cover-heart">
            <Image src="/cover-a-nordic-childhood.png" alt="" width={1275} height={1650} sizes="(max-width: 720px) 42vw, 330px" loading="eager" fetchPriority="high" />
          </div>
          <div className="cover-object workbook cover-first-letters">
            <span className="wire-binding" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</span>
            <Image src="/hero-cover-first-letters.png" alt="" width={480} height={682} sizes="(max-width: 720px) 30vw, 220px" loading="eager" />
          </div>
          <div className="cover-object workbook cover-words-together">
            <span className="wire-binding" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} />)}</span>
            <Image src="/hero-cover-words-together.png" alt="" width={480} height={682} sizes="(max-width: 720px) 30vw, 220px" loading="eager" />
          </div>
          <div className="pdf-seal" aria-hidden="true">
            <span>PRINTABLE</span>
            <strong>PDF</strong>
            <span>COLLECTION</span>
          </div>
          <p className="background-caption">One heart. Two learning paths. Practice only when it helps.</p>
        </div>
        <div className="background-copy">
          <p className="background-eyebrow">A NORDIC CHILDHOOD: THE LEARNING COLLECTION</p>
          <h1 id="background-title">One useful page is enough.</h1>
          <p className="background-lede">
            A Nordic printable collection for early numbers, letters, meaningful writing,
            nature, and feelings. Choose what fits your child today. Leave the rest for later.
          </p>

          <div className="background-actions">
            <CheckoutLink className="background-button" href={checkoutUrl} placement="hero">
              <span>Get the complete collection</span>
              <span className="background-arrow" aria-hidden="true">
                <svg viewBox="0 0 20 20" focusable="false">
                  <path d="M4 10h11M11 6l4 4-4 4" />
                </svg>
              </span>
            </CheckoutLink>
            <span className="background-price">
              <strong>US $29 once</strong>
              <small>Digital download. Printable PDFs.</small>
            </span>
          </div>

          <dl className="background-facts" aria-label="Collection summary">
            <div><dt>313</dt><dd>PDF pages</dd></div>
            <div><dt>8</dt><dd>core books and guides</dd></div>
            <div><dt>1</dt><dd>page can be enough today</dd></div>
          </dl>
        </div>

      </section>

      <div className="test-principles" aria-label="Collection principles">
        <span>PRINT ONLY WHAT HELPS</span>
        <i aria-hidden="true" />
        <span>BEGIN TOGETHER</span>
        <i aria-hidden="true" />
        <span>KEEP WHAT CARRIES SOMETHING REAL</span>
      </div>

      <section className="warm-nordic" id="nordic" aria-labelledby="warm-nordic-title">
        <div className="warm-nordic-copy">
          <p className="warm-nordic-note">WHY NORDIC?</p>
          <h2 id="warm-nordic-title">Five of the six happiest countries in the world are Nordic.</h2>
          <p className="warm-nordic-question">What, if anything, might that have to do with childhood?</p>
          <p className="warm-nordic-lede">
            Finland, where I grew up, has now been ranked the world&apos;s happiest
            country for nine years in a row.
          </p>
          <p className="warm-nordic-body">
            I do not believe there is a secret Nordic formula for happiness. And no
            book can promise a happy childhood. But I do believe it is worth looking
            at what a Nordic childhood can make room for: time outdoors, ordinary
            independence, feelings that can be named, quiet courage, and enough
            rather than more. Those ideas shaped this collection.
          </p>
          <p className="warm-nordic-source">
            Source:{' '}
            <a
              href="https://www.worldhappiness.report/news/world-happiness-report-2026-complex-global-picture-of-social-media-and-happiness/"
              target="_blank"
              rel="noreferrer"
            >
              World Happiness Report 2026
            </a>
            . Rankings reflect how residents evaluate their lives, averaged across 2023 to 2025.
          </p>
          <p className="warm-nordic-for-everyone">Rooted in Nordic childhood. Made for families everywhere.</p>

          <dl className="warm-nordic-ideas" aria-label="Nordic ideas in the collection">
            <div><dt>friluftsliv</dt><dd>outdoor life</dd></div>
            <div><dt>lagom</dt><dd>enough</dd></div>
            <div><dt>sisu</dt><dd>quiet courage</dd></div>
            <div><dt>känslor</dt><dd>the inner world</dd></div>
          </dl>
        </div>

        <figure className="warm-nordic-page">
          <PagePreview
            src="/small-brave-things-page.png"
            alt="A Nordic Childhood page titled Small brave things, about quiet everyday courage"
            title="Small brave things"
          />
          <figcaption>“Small brave things,” page 93 of <i>A Nordic Childhood</i></figcaption>
        </figure>
      </section>

      <section className="warm-progression" id="pages" aria-labelledby="warm-progression-title">
        <header className="warm-progression-heading">
          <h2 id="warm-progression-title">Learning that moves toward the child&apos;s own mark.</h2>
          <div className="warm-progression-intro">
            <p className="warm-progression-label">SEE THE PROGRESSION</p>
            <p>Three real pages. Three parts of the same idea: begin with meaning, offer support, then make room.</p>
          </div>
        </header>

        <div className="warm-progression-track">
          {progression.map((item) => (
            <article className={`warm-stage ${item.tone}`} key={item.step}>
              <div className="warm-stage-marker" aria-hidden="true">
                <span>{item.step}</span>
              </div>
              <figure className="warm-stage-page">
                <PagePreview src={item.image} alt={item.alt} title={item.title} />
              </figure>
              <div className="warm-stage-copy">
                <p className="warm-stage-label">{item.eyebrow}</p>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="warm-sampler" id="quiet-start" aria-labelledby="warm-sampler-title">
        <div className="warm-sampler-pages" aria-hidden="true">
          <Image src="/progression-number-five-hires.png" alt="" width={1679} height={2382} sizes="(max-width: 720px) 52vw, 360px" quality={85} />
          <Image src="/progression-letter-a-hires.png" alt="" width={1679} height={2382} sizes="(max-width: 720px) 52vw, 360px" quality={85} />
          <Image src="/progression-words-keepsake-hires.png" alt="" width={1679} height={2382} sizes="(max-width: 720px) 52vw, 360px" quality={85} />
        </div>

        <div className="warm-sampler-copy">
          <h2 id="warm-sampler-title">A first look, sent to your inbox.</h2>
          <p className="warm-sampler-intro">
            <i>A Quiet Start</i> is a free sampler made from a small selection of
            real pages in the collection. Ask me for a copy, then print the page
            that feels most relevant today.
          </p>
          <p>
            One sampler cannot predict which of the 313 pages will interest your
            child. It can show you the tone, instructions, and approach before you decide.
          </p>

          <div className="warm-sampler-form-shell">
            <iframe
              className="warm-sampler-form"
              src="https://link.contentcreatormachine.com/widget/form/wmrfE0tovcS6hTJJnfg5?v=2"
              title="Request A Quiet Start"
              loading="lazy"
            />
          </div>
          <p className="warm-sampler-note" id="warm-sampler-note">
            Your sampler is sent whether or not you choose the five-day email series. By
            submitting, you agree that we may use your email address to deliver the sampler.{' '}
            <Link href="/privacy">Read the privacy notice.</Link>
          </p>
        </div>
      </section>

      <section className="warm-keepsake" id="keepsakes" aria-labelledby="warm-keepsake-title">
        <div className="warm-keepsake-copy">
          <h2 id="warm-keepsake-title">Some pages teach. Some are designed to keep what happened.</h2>
          <p className="warm-keepsake-lede">
            Sixteen dedicated keepsake pages leave room for a name, age, date,
            the child&apos;s own marks, and sometimes their exact words.
          </p>
          <p>
            These are ordinary printable pages. No special ink that fades. No
            wipe-clean surface that returns the page to blank. When a child makes
            a first word or draws five in their own way, the mark can remain.
          </p>
          <p className="warm-keepsake-close">You do not need to save everything. Keep the few pages that still feel like the child years later.</p>
        </div>

        <figure className="warm-keepsake-page">
          <PagePreview
            src="/progression-words-keepsake-hires.png"
            alt="Words Together keepsake page titled My words in the world"
            title="My words in the world"
          />
        </figure>
      </section>

      <section className="warm-formation" id="formation" aria-labelledby="warm-formation-title">
        <div className="warm-formation-copy">
          <h2 id="warm-formation-title">The path helps at the beginning, then gives the pencil back to the child.</h2>
          <p className="warm-formation-lede">
            Some handwriting books use a physical groove, sometimes called a furrow,
            to keep the pencil on one fixed track. The pages in this collection use
            support differently.
          </p>
          <p>
            The child first follows a large pale path with a finger. Next comes one
            guided trace. Then the path disappears, leaving open space for the
            child&apos;s own attempt.
          </p>

          <ol className="warm-formation-steps" aria-label="The three formation steps">
            <li><span>1</span><strong>Follow</strong><small>with a finger</small></li>
            <li><span>2</span><strong>Trace</strong><small>one path</small></li>
            <li><span>3</span><strong>Try</strong><small>without it</small></li>
          </ol>

          <p className="warm-formation-close">
            The aim is not a row of identical marks. It is to help the child feel the
            movement, recognise the shape, and begin making it without the path.
          </p>
        </div>

        <figure className="warm-formation-page">
          <PagePreview
            src="/progression-letter-a-hires.png"
            alt="Complete Meet A page from First Letters"
            title="Meet A"
          />
          <figcaption>Shown in <i>First Letters</i>. The number pages use the same gentle rhythm.</figcaption>
        </figure>
      </section>

      <section className="warm-learning-map" id="learning-paths" aria-labelledby="warm-learning-map-title">
        <header className="warm-map-heading">
          <p className="warm-map-eyebrow">WHAT IS INSIDE</p>
          <h2 id="warm-learning-map-title">One heart. Two learning paths.</h2>
          <p>Begin with the part that fits your child now. The books belong together, but they do not have to be used in order or all at once.</p>
        </header>

        <article className="warm-map-heart">
          <div className="warm-map-heart-cover">
            <PagePreview
              src="/cover-a-nordic-childhood.png"
              alt="Cover of A Nordic Childhood"
              title="A Nordic Childhood"
              kind="cover"
            />
          </div>
          <div className="warm-map-heart-copy">
            <p className="warm-map-label">THE HEART</p>
            <h3>A Nordic Childhood</h3>
            <p>Nature, feelings, courage, handwriting, poems, reflection, and open pages.</p>
            <p>Return to it when a season, question, or feeling makes one page relevant.</p>
          </div>
        </article>

        <div className="warm-map-paths">
          <article className="warm-map-path warm-map-number-path">
            <header className="warm-map-path-heading">
              <p className="warm-map-label">THE NUMBER PATH</p>
              <h3>See it. Make it. Notice what changes.</h3>
            </header>
            <div className="warm-map-cover-pair" aria-label="The two number books">
              <WorkbookCover src="/cover-first-numbers.png" alt="Cover of First Numbers" />
              <WorkbookCover src="/cover-numbers-together.png" alt="Cover of Numbers Together" />
            </div>
            <div className="warm-map-book-copy">
              <div>
                <h4>First Numbers</h4>
                <p>See and make quantities before beginning to write numerals 0 to 10.</p>
              </div>
              <div>
                <h4>Numbers Together</h4>
                <p>Compare amounts, find parts of a whole, and notice what changes when groups are joined or separated.</p>
              </div>
            </div>
          </article>

          <article className="warm-map-path warm-map-letter-path">
            <header className="warm-map-path-heading">
              <p className="warm-map-label">THE LETTER AND WORD PATH</p>
              <h3>See it. Hear it. Then use it.</h3>
            </header>
            <div className="warm-map-cover-pair" aria-label="The letter and word books">
              <WorkbookCover src="/cover-first-letters.png" alt="Cover of First Letters" />
              <WorkbookCover src="/cover-words-together.png" alt="Cover of Words Together" />
            </div>
            <div className="warm-map-book-copy">
              <div>
                <h4>First Letters</h4>
                <p>Meet print letters through shape, sound, finger movement, and the child&apos;s own name.</p>
              </div>
              <div>
                <h4>Words Together</h4>
                <p>Let first words become labels, captions, notes, signs, and messages.</p>
              </div>
            </div>
          </article>
        </div>

        <aside className="warm-map-practice">
          <div className="warm-map-practice-copy">
            <p className="warm-map-label">2 BONUS PRACTICE BOOKS</p>
            <h3>More repetition, ready when it is useful.</h3>
            <p>Add practice only when the child wants or needs it. Both books are included from the beginning, but they do not have to be used from the beginning.</p>
          </div>
          <div className="warm-map-bonus-books" aria-label="The two bonus practice books">
            <div className="warm-map-bonus-book number-bonus">
              <span>BONUS</span>
              <small>A NORDIC CHILDHOOD</small>
              <strong>Extra Number<br />Practice</strong>
              <em>0 to 10</em>
            </div>
            <div className="warm-map-bonus-book letter-bonus">
              <span>BONUS</span>
              <small>A NORDIC CHILDHOOD</small>
              <strong>Extra Letter<br />Practice</strong>
              <em>A to Z</em>
            </div>
          </div>
        </aside>
      </section>

      <section className="warm-midpoint-offer" aria-labelledby="warm-midpoint-title">
        <div className="warm-midpoint-copy">
          <h2 id="warm-midpoint-title">Seen enough to begin?</h2>
          <p>The complete printable collection, 313 pages for US $29 once.</p>
        </div>
        <div className="warm-midpoint-action">
          <CheckoutLink href={checkoutUrl} placement="midpoint">Get the complete collection</CheckoutLink>
          <small>Digital download. Printable PDFs.</small>
        </div>
      </section>

      <section className="warm-founder-story" id="founder-story" aria-labelledby="warm-founder-title">
        <div className="warm-founder-copy">
          <h2 id="warm-founder-title">The page that survived.</h2>
          <p className="warm-founder-intro">
            The page beside this story is from Christmas 1985, when my son Fredrik
            was two. It says “Julen 1985, Esplunda,” the place where we lived.
          </p>
          <p>
            Three years later, Fredrik wrote a letter to his grandmother. It had
            several pages. I remember it. For years I was sure I had a photograph
            of it, and I may still have the original somewhere. But I cannot find
            either now.
          </p>
          <p>
            The Christmas page survived. The letter may still be in a box somewhere,
            but for now it exists only in memory.
          </p>

          <blockquote>That difference sits quietly behind this collection.</blockquote>

          <p>
            Most practice pages can do their work and go. But sometimes a page
            carries more than the skill being practised. A first name. A number
            drawn in the child&apos;s own way. A thought they wanted someone else to know.
          </p>
          <p className="warm-founder-close">
            I cannot tell you which pages those will be.<br />
            You will know when one feels like your child.
          </p>
        </div>

        <div className="warm-founder-visual">
          <figure className="warm-founder-portrait">
            <Image src="/erik-forest-portrait.jpg" alt="Erik Åstrand sitting among rocks in a Nordic pine forest" width={1920} height={1920} sizes="(max-width: 720px) 92vw, 520px" />
            <figcaption>Erik Åstrand, author of <i>A Nordic Childhood</i></figcaption>
          </figure>
          <figure className="warm-family-archive">
            <Image src="/fredrik-christmas-1985.jpg" alt="An early family page with Fredrik's Christmas words from Esplunda in 1985" width={2592} height={1728} sizes="(max-width: 720px) 74vw, 380px" />
            <figcaption>Fredrik&apos;s Christmas words, Esplunda, 1985.</figcaption>
          </figure>
        </div>
      </section>

      <section className="warm-proof" id="proof" aria-labelledby="warm-proof-title">
        <div className="warm-proof-copy">
          <h2 id="warm-proof-title">Look closely before you decide.</h2>
          <p>
            This is a new collection, so there are not yet enough customer reviews
            to make broad claims about results.
          </p>
          <p className="warm-proof-principle">You should not have to rely on claims.</p>
          <p>
            You can look at real pages, see how the learning progresses, read exactly
            what is included, and begin with the free sampler if you prefer.
          </p>
        </div>

        <div className="warm-proof-evidence" aria-label="What visitors can verify">
          <article>
            <h3>Real pages</h3>
            <p>The examples on this page come from the books you receive.</p>
          </article>
          <article>
            <h3>A visible progression</h3>
            <p>See where the support begins, how it changes, and where the child tries alone.</p>
          </article>
          <article>
            <h3>Exact facts</h3>
            <p>Page counts, formats, printing help, household terms, and the price are stated plainly.</p>
          </article>
        </div>
      </section>

      <section className="warm-research" id="research" aria-labelledby="warm-research-title">
        <header className="warm-research-heading">
          <h2 id="warm-research-title">Research can guide a choice. It cannot promise a result.</h2>
          <div>
            <p>No study can tell you exactly how your child will respond to this collection, or any collection of learning books.</p>
            <p>Research can still help us decide what support to offer, what not to overuse, and what should come next.</p>
          </div>
        </header>

        <div className="warm-research-findings">
          <article>
            <h3>Tracing begins the movement. It does not finish the learning.</h3>
            <div className="warm-research-body">
              <p>In one study, five-year-olds learned unfamiliar symbols in six different ways. Children who saw varied examples later recognised new versions of those symbols better than children who learned from highly similar forms. Handwriting is one way children naturally produce that useful variation.</p>
              <p>A separate study found that a reading-related brain network was recruited after five-year-olds printed letters, but not after they typed or traced them.</p>
              <p>Neither study tells us that a workbook page will teach a child to read. They do give us a reason to move beyond repeated tracing and leave room for the child&apos;s own attempt.</p>
              <strong>That is why these pages use Follow, Trace, Try. The path helps at first. Then it disappears.</strong>
            </div>
          </article>

          <article>
            <h3>Numbers begin as quantities, not marks on paper.</h3>
            <div className="warm-research-body">
              <p>Guidance from the Institute of Education Sciences recommends teaching early number and operations through a developmental progression.</p>
              <p>It also encourages helping children notice and describe mathematics in the world around them, although the evidence supporting that second recommendation is more limited.</p>
              <strong>That thinking informed pages where children see, make, move, compare, join, and separate quantities before a written numeral carries the whole task.</strong>
            </div>
          </article>
        </div>

        <details className="warm-research-notes">
          <summary>Read the research notes</summary>
          <ol>
            {researchNotes.map((note) => (
              <li key={note.number}>
                {note.authors}{' '}
                <a href={note.href} target="_blank" rel="noreferrer">“{note.title}.”</a>{' '}
                <i>{note.publication}</i>
              </li>
            ))}
          </ol>
        </details>
      </section>

      <section className="warm-offer" id="collection" aria-labelledby="warm-offer-title">
        <header className="warm-offer-heading">
          <h2 id="warm-offer-title">Everything included for US $29 once.</h2>
          <p>
            One digital collection to draw from as your child becomes interested in
            numbers, letters, words, nature, feelings, and making marks of their own.
          </p>
        </header>

        <div className="warm-offer-layout">
          <div className="warm-offer-inventory" aria-label="Books and guides included">
            <div className="warm-offer-group warm-offer-heart">
              <div>
                <span>The heart</span>
                <h3>A Nordic Childhood</h3>
                <p>Nature, feelings, courage, quiet observation, and Nordic ways of seeing childhood.</p>
              </div>
              <strong>119 <small>pages</small></strong>
            </div>

            <div className="warm-offer-group">
              <div>
                <span>The number path</span>
                <h3>First Numbers</h3>
                <p>Seeing, making, and writing quantities from 0 to 10.</p>
                <h3>Numbers Together</h3>
                <p>Comparing, composing, joining, separating, and changing quantities within 10.</p>
              </div>
              <strong>88 <small>pages</small></strong>
            </div>

            <div className="warm-offer-group">
              <div>
                <span>The letter and word path</span>
                <h3>First Letters</h3>
                <p>Shape, sound, letter formation, and the child&apos;s own name.</p>
                <h3>Words Together</h3>
                <p>Words, labels, captions, notes, signs, and messages.</p>
              </div>
              <strong>60 <small>pages</small></strong>
            </div>

            <div className="warm-offer-group warm-offer-bonus">
              <div>
                <span>Two bonus practice books</span>
                <h3>Extra Number Practice, 0 to 10</h3>
                <p>14 pages for repetition when it is useful.</p>
                <h3>Extra Letter Practice, A to Z</h3>
                <p>28 pages for repetition when it is useful.</p>
              </div>
              <strong>42 <small>pages</small></strong>
            </div>

            <div className="warm-offer-group warm-offer-guide">
              <div>
                <span>Begin here</span>
                <h3>Start Here guide</h3>
                <p>Four pages explaining how to choose and print a page.</p>
              </div>
              <strong>4 <small>pages</small></strong>
            </div>
          </div>

          <aside className="warm-purchase">
            <div className="warm-purchase-covers" aria-hidden="true">
              <Image src="/cover-first-numbers.png" alt="" width={1054} height={1492} sizes="(max-width: 720px) 28vw, 160px" />
              <Image src="/cover-a-nordic-childhood.png" alt="" width={1275} height={1650} sizes="(max-width: 720px) 28vw, 160px" />
              <Image src="/cover-first-letters.png" alt="" width={1054} height={1492} sizes="(max-width: 720px) 28vw, 160px" />
            </div>
            <p className="warm-purchase-total"><strong>313</strong><span>pages across eight core PDFs</span></p>
            <ul>
              <li>Five main learning books</li>
              <li>Two bonus practice books</li>
              <li>One four-page Start Here guide</li>
              <li>Six additional US Letter print-and-cut editions</li>
              <li>Personal household use</li>
            </ul>
            <p className="warm-purchase-price"><span>US</span> $29 <small>one time</small></p>
            <CheckoutLink className="warm-purchase-button" href={checkoutUrl} placement="offer">Get the complete collection</CheckoutLink>
            <p className="warm-purchase-note">Digital download. Printable PDFs.</p>
          </aside>
        </div>

        <p className="warm-offer-close">Print only what fits today. Return to the rest when it becomes useful.</p>
      </section>

      <section className="warm-faq" id="questions" aria-labelledby="warm-faq-title">
        <header className="warm-faq-heading">
          <h2 id="warm-faq-title">Questions you may still have.</h2>
          <p>Open the question that matters now. Leave the rest for later.</p>
        </header>

        <div className="warm-faq-list">
          {faqs.map((faq, index) => (
            <details key={faq.question} open={index === 0 ? true : undefined}>
              <summary>
                <span>{faq.question}</span>
                <i className="warm-faq-mark" aria-hidden="true" />
              </summary>
              <div className="warm-faq-answer">{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="warm-closing" aria-labelledby="warm-closing-title">
        <div className="warm-closing-copy">
          <h2 id="warm-closing-title">Begin with the page that fits today.</h2>
          <p>You do not need to know which book your child will finish.</p>
          <p>You do not need to print the whole collection or turn it into another programme to manage.</p>
          <p>Choose one page that meets something already beginning: a number being noticed, a letter from their name, a question about the outdoors, a feeling that needs words, or an idea they want to put on paper.</p>
          <p>Some pages will be passed over. Some will do their work once and be recycled. A few may hold something you want to remember.</p>
          <p className="warm-closing-enough">One page is a good place to begin.</p>
        </div>

        <aside className="warm-closing-purchase">
          <h3>The complete digital collection</h3>
          <ul>
            <li>313 pages across eight core PDFs</li>
            <li>Six US Letter print-and-cut editions</li>
            <li>Two bonus practice books</li>
            <li>Personal household use</li>
          </ul>
          <p className="warm-closing-price">US $29 <span>one time</span></p>
          <CheckoutLink href={checkoutUrl} placement="closing">Get the complete collection</CheckoutLink>
          <small>Digital download. Printable PDFs.</small>
        </aside>

      </section>

      <footer className="warm-footer">
        <a className="warm-footer-wordmark" href="#top" aria-label="Return to the top of A Nordic Childhood">
          <span aria-hidden="true">✣</span>
          <strong>A NORDIC CHILDHOOD</strong>
        </a>
        <div className="warm-footer-meta">
          <p>Rooted in Nordic childhood. Made for families everywhere.</p>
          <Link href="/privacy">Privacy</Link>
          <Link href="/recover">Recover a purchase</Link>
        </div>
      </footer>
    </main>
  );
}
