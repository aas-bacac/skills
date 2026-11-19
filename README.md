# Skills beyond astronomy

A website for the [AAS-BACAC skills guide](https://github.com/aas-bacac/skills/wiki), prominently marked **(Under development)**. The atlas is the main experience at [aas-bacac.github.io/skills](https://aas-bacac.github.io/skills/), using real wiki content without changing the wiki. The flat wiki remains available through the header's "Read the skills guide" link.

## Skills and careers atlas

Start the local server and open http://localhost:4321. The design comparison, career-card prototype, and roadmap prototype are retired. Their old `/concepts/` URLs redirect to the atlas, including the former `/concepts/relationships/` atlas address.

The interaction is astronomy experience -> industry equivalent -> career connection -> further wiki topic. Try **Query astronomical catalogs** (SQL), **Fit models to observations** (machine learning), or **Explain technical findings** (technical communication). Experience selections have reloadable links, for example `/#experience=communication`.

On desktop the atlas supports node selection, zoom, fit, a connections-only filter, and standard text controls for the same selections; nodes cannot be dragged and gesture panning is disabled. Up to 900px wide it uses a fixed native connection diagram instead of a touch-capturing canvas, with normal page scrolling, 16px controls and reading text, and touch targets of at least 44px. Switching off the filter shows all seven astronomy paths. Selecting a mobile career brings its details into view.

Career names and five role descriptions are extracted from the source Markdown. The wiki names systems engineer and test engineer without describing them; the atlas explicitly preserves that gap. Role-topic connections and astronomy entry labels are proposed editorial metadata. They are **not** assessed suitability, hiring requirements, prerequisite chains, or a complete training plan. Aerospace connections use field-wide topics, not role-specific source claims. The atlas does not invent salaries or credentials.

### Readable source

The full source remains available in the wiki. The local `/guide/` route is retained for existing links and the no-JavaScript source fallback, but is not promoted as a design alternative in the atlas.

### Reference notes

These sites informed the early interaction designs; their content, artwork, and datasets are not copied into the website.

- [roadmap.sh](https://roadmap.sh/) separates role-oriented paths from skill-oriented paths. The roadmap concept borrows the path-first structure, not an asserted universal curriculum.
- [LabXchange CareerXplorer](https://www.labxchange.org/careerxplorer/explore/careers) uses a filterable directory and consistent role profiles. BACAC does not supply the salary and credential data shown there, so those fields are omitted here.
- [University of Michigan career wheel](https://lsa.umich.edu/lsa/academics/what-will-you-do-with-an-LSA-degree.html) makes many-to-many degree/career connections visible. Its edges represent surveyed alumni outcomes. Our connections are suggestions, so there are no weighted ribbons, probabilities, or numerical fit claims.
- [Our World in Data](https://ourworldindata.org/) pairs explorable views with clear source information and caveats. Source links and limits remain close to the BACAC content.
- [Harvard Atlas of Economic Complexity](https://atlas.hks.harvard.edu/) organizes exploration around relationships and possible destinations. The BACAC atlas uses selection and highlighting, without importing economic complexity scores or implying a computed career recommendation.
- [Distill: Communicating with Interactive Articles](https://distill.pub/2020/communicating-with-interactive-articles/) discusses details on demand, segmentation, and reducing cognitive load. Topic readers let the full source remain available without showing every paragraph at once.

## Run locally

Node.js 22.18 or newer is required. A verified Node 22 toolchain was installed for this machine under `$HOME/.local/share/node`; it does not change system packages.

```sh
export PATH="$HOME/.local/share/node/bin:$PATH"
npm ci
npm run dev
```

Open http://localhost:4321. If that port is in use, Astro reports the alternative port. The development server binds to loopback; when using Remote SSH, forward that port through VS Code's Ports panel.

```sh
npm test
npm run build
npm run preview
```

`npm run build` typechecks and creates a static site in `dist`. The lockfile fixes dependency versions for `npm ci`.

## Browser checks

With the development server running:

```sh
npx playwright install chromium
npm run test:e2e
```

On this machine, missing Chromium libraries were extracted locally rather than installed system-wide. Add this environment variable when running Playwright here:

```sh
export LD_LIBRARY_PATH="$HOME/.local/share/skills-browser-libs/usr/lib/x86_64-linux-gnu${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
npm run test:e2e
```

The suite covers the atlas and retained source guide: desktop/mobile interactions, source equivalents and role connections, retired-route redirects, topic readers, mobile focus and swipe scrolling, readable controls, deep links, graph canvas pixels, fixed node positions, selection, zoom, automated WCAG checks, no-JavaScript source access, and page overflow at phone through large desktop sizes. Tests use the reduced-motion preference for stable screenshots and contrast checks. Automated checks do not replace a human accessibility review.

Set `SKILLS_URL` to test another running instance. Review screenshots are generated into the locally ignored `review/` folder; Playwright failure traces go into `test-results/`.

Atlas screenshots are named `review/atlas-{desktop,mobile}.png`.

## Content and provenance

- `src/content/Skills.md` and `src/content/Home.md` are unchanged snapshots of the wiki taken on 2026-11-19. All 18 source topics are included. No new career advice was added to the source text.
- `src/lib/catalog.ts` parses the Markdown with mdast, assigns concise navigation titles, and stores the proposed connections and theme assignments separately from the source wording. Rendered HTML is sanitized.
- `src/lib/careers.ts` extracts all seven role names and five available descriptions from the Markdown AST, validates references, and keeps proposed experience/role/topic associations separate. Its tests detect missing source role definitions and invalid topic links.
- Explicit astronomy/industry analogues become comparison panels. Placeholder text is retained; sparse or explicitly unfinished entries are labeled as starting points.
- The original complete documents and source links are available from the interface.
- The `wiki/` directory, when present locally, is a separate Git clone. Do not commit its contents into the main repository. Content tests compare against that clone when available, but a fresh website checkout does not require the wiki clone to build.

To refresh the snapshot intentionally, review wiki changes, copy the two Markdown files into `src/content/`, and run the content tests. Changes to source topic counts/order require reviewing the corresponding metadata. There is deliberately no automatic wiki sync that could silently overwrite website edits.

The nebula photograph is by [Jeremy Thomas on Unsplash](https://unsplash.com/photos/E0AHdsENmDg), downloaded to `public/images/nebula.jpg` under the [Unsplash license](https://unsplash.com/license). Fonts are self-hosted DM Sans and Newsreader via Fontsource. Icons are from Lucide; the favicon is an original simple orbital mark.

## GitHub Pages

Pages uses GitHub Actions. The deployment workflow is `.github/workflows/pages.yml`: pushes to the `website-prototype` branch install locked dependencies, run the content tests and production build, and deploy the static artifact. The `main` branch and separate wiki are not modified by publication.

The public homepage is the atlas, with the development notice above the masthead and a direct link to the flat wiki. Retired `/skills/concepts/` URLs redirect to `/skills/`. The retained source-guide fallback is at `/skills/guide/`.

Project Pages needs the repository subpath. The workflow obtains it from GitHub Pages configuration; to reproduce the production build locally:

```sh
BASE_PATH=/skills/ npm run build
```

The base defaults to `/` for local work. The production origin is configured in `astro.config.mjs`; update that origin and the Pages settings if the repository moves or a custom domain is introduced. Review source changes and editorial relationships before pushing updates to the publication branch.