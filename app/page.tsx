const progression = [
  {
    step: '01',
    eyebrow: 'SEE IT',
    title: 'Meet the idea before the symbol',
    copy: 'A number begins as something the child can see, make, move, and compare. The written numeral comes when it has something to mean.',
    image: '/number-five-page.png',
    alt: 'First Numbers page showing five in a row and five in a new arrangement',
    tone: 'ochre',
  },
  {
    step: '02',
    eyebrow: 'HEAR AND FORM IT',
    title: 'Let the support gently disappear',
    copy: 'See the letter. Hear a useful sound. Follow the movement with a finger, trace once, then make an attempt without the path.',
    image: '/letter-a-page.png',
    alt: 'First Letters page introducing uppercase and lowercase A',
    tone: 'berry',
  },
  {
    step: '03',
    eyebrow: 'MAKE IT MATTER',
    title: 'Give early writing a reason to exist',
    copy: 'A first word can name something. A caption can preserve a moment. A message can reach another person. Meaning comes before neatness.',
    image: '/words-keepsake-page.png',
    alt: 'Words Together keepsake page titled My words in the world',
    tone: 'slate',
  },
];

export default function Home() {
  return (
    <main>
      <nav className="nav-shell" aria-label="Main navigation">
        <a className="wordmark" href="#top" aria-label="A Nordic Childhood home">
          <span className="wordmark-mark" aria-hidden="true">✣</span>
          <span>A NORDIC CHILDHOOD</span>
        </a>
        <div className="nav-links">
          <a href="#nordic">Why Nordic</a>
          <a href="#pages">See the pages</a>
          <a href="#keepsakes">Keepsakes</a>
        </div>
        <a className="nav-cta" href="#collection">View the collection</a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">A NORDIC CHILDHOOD: THE LEARNING COLLECTION</p>
          <h1>One useful page is enough.</h1>
          <p className="hero-lede">
            A Nordic printable collection for early numbers, letters, meaningful writing,
            nature, and feelings. Choose what fits your child today. Leave the rest for later.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#collection">
              See what is included <span aria-hidden="true">→</span>
            </a>
            <span className="price-note">US $29 once</span>
          </div>
          <dl className="hero-facts" aria-label="Collection summary">
            <div><dt>313</dt><dd>PDF pages</dd></div>
            <div><dt>8</dt><dd>core books and guides</dd></div>
            <div><dt>1</dt><dd>page can be enough today</dd></div>
          </dl>
        </div>

        <div className="hero-art" aria-label="The five books in A Nordic Childhood: The Learning Collection">
          <div className="hero-art-halo" />
          <img src="/collection-hero.png" alt="Five illustrated covers from A Nordic Childhood: The Learning Collection" />
          <p className="art-caption">One heart. Two learning paths. Practice only when it helps.</p>
        </div>
      </section>

      <div className="quiet-strip" aria-label="Collection principles">
        <span>PRINT ONLY WHAT HELPS</span>
        <i aria-hidden="true" />
        <span>BEGIN TOGETHER</span>
        <i aria-hidden="true" />
        <span>KEEP WHAT CARRIES SOMETHING REAL</span>
      </div>

      <section className="nordic-section" id="nordic">
        <div className="nordic-page-wrap">
          <div className="page-shadow page-shadow-one" />
          <div className="page-shadow page-shadow-two" />
          <img src="/sisu-tree-page.png" alt="A Nordic Childhood page titled The tree that holds the snow, introducing sisu" />
        </div>

        <div className="nordic-copy">
          <p className="eyebrow">MORE THAN A VISUAL STYLE</p>
          <h2>Nordic is not the decoration. It is the way the collection sees childhood.</h2>
          <p className="large-copy">
            The books draw on ideas Erik grew up with on the coast of Finland:
            time outdoors, room to notice, quiet courage, enough rather than more,
            and trust that children can make meaning of their own experience.
          </p>
          <p>
            That changes the learning pages too. Numbers begin with real quantities.
            Letters meet useful sounds and natural forms. Early writing is allowed to
            name something, preserve a moment, make a sign, or reach another person.
          </p>
          <div className="nordic-ideas" aria-label="Nordic ideas in the collection">
            <span>friluftsliv<small>outdoor life</small></span>
            <span>lagom<small>enough</small></span>
            <span>sisu<small>quiet courage</small></span>
            <span>känslor<small>the inner world</small></span>
          </div>
        </div>
      </section>

      <section className="progression-section" id="pages">
        <header className="section-heading">
          <p className="eyebrow">SEE THE PROGRESSION</p>
          <h2>Learning that moves toward the child&apos;s own mark.</h2>
          <p>Three real pages. Three parts of the same idea: begin with meaning, offer support, then make room.</p>
        </header>

        <div className="progression-grid">
          {progression.map((item) => (
            <article className={`progression-card ${item.tone}`} key={item.step}>
              <div className="card-number">{item.step}</div>
              <div className="preview-frame">
                <img src={item.image} alt={item.alt} />
              </div>
              <div className="card-copy">
                <p className="card-eyebrow">{item.eyebrow}</p>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="keepsake-section" id="keepsakes">
        <div className="keepsake-copy">
          <p className="eyebrow">MADE TO BE USED. MADE TO REMAIN.</p>
          <h2>Some pages teach. Some are designed to keep what happened.</h2>
          <p className="large-copy">
            Sixteen dedicated keepsake pages leave room for a name, age, date,
            the child&apos;s own marks, and sometimes their exact words.
          </p>
          <p>
            These are ordinary printable pages. No special ink that fades. No
            wipe-clean surface that returns the page to blank. When a child makes
            a first word or draws five in their own way, the mark can remain.
          </p>
          <p className="keepsake-line">You do not need to save everything. Keep the few pages that still feel like the child years later.</p>
        </div>
        <figure className="keepsake-figure">
          <img src="/words-keepsake-page.png" alt="My words in the world dated writing keepsake page" />
          <figcaption>One of sixteen purpose-built keepsake pages</figcaption>
        </figure>
      </section>

      <section className="collection-summary" id="collection">
        <p className="eyebrow">FIRST VISUAL PROTOTYPE</p>
        <h2>The collection, at a glance.</h2>
        <p>Eight core PDFs. 313 pages. Six additional US Letter print-and-cut editions. Fifteen customer files in one download.</p>
        <div className="summary-bottom">
          <strong>US $29 once</strong>
          <span>Personal household use</span>
          <button type="button" disabled>Checkout will be connected later</button>
        </div>
      </section>
    </main>
  );
}
