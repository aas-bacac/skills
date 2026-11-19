# Skills beyond astronomy

A website for the [AAS-BACAC skills guide](https://github.com/aas-bacac/skills/wiki), prominently marked **(Under development)**. The atlas is the homepage at [aas-bacac.github.io/skills](https://aas-bacac.github.io/skills/). Three standalone career-exploration concepts use real wiki content without changing the wiki. The earlier integrated field guide is preserved at `/guide/`.

## Review the alternatives

Start the local server and open the [comparison page](http://localhost:4321/concepts/). Each concept is a separate page, not another tab on a combined homepage.

| Concept | Local URL | Primary question |
| --- | --- | --- |
| Searchable career explorer | http://localhost:4321/concepts/explorer/ | Which careers connect with my astronomy experience? |
| Career-path roadmap | http://localhost:4321/concepts/roadmap/ | What topics could I explore toward a chosen role? |
| Skills-to-careers atlas | http://localhost:4321/concepts/relationships/ | Where else might this capability be useful? |

The shared interaction is astronomy experience -> industry equivalent -> career connection -> further wiki topic. Try **Query astronomical catalogs** (SQL), **Fit models to observations** (machine learning), or **Explain technical findings** (technical communication). Experience selections have reloadable links, for example `/concepts/explorer/#experience=communication`.

The explorer searches role descriptions and associated source topics, with sector and connection filters. The roadmap has role navigation, suggested topic stages, and source detail. The atlas supports node selection, zoom, fit, a connections-only filter, and standard text controls for the same selections. On phones it defaults to a focused portrait graph; switching off the filter restores the complete scrollable network. Card and roadmap selections bring their detail area into view on smaller screens.

Career names and five role descriptions are extracted from the source Markdown. The wiki names systems engineer and test engineer without describing them; the prototypes explicitly preserve that gap. Role-topic connections, astronomy entry labels, and reading order are proposed editorial metadata. They are **not** assessed suitability, hiring requirements, prerequisite chains, or a complete training plan. Aerospace connections use field-wide topics, not role-specific source claims. The prototypes do not invent salaries or credentials.

### Earlier field guide

These original views remain unchanged:

| View | Local URL | Question it helps explore |
| --- | --- | --- |
| Field guide | http://localhost:4321/guide/#view=guide | What topics interest me? |
| Connections | http://localhost:4321/guide/#view=map | How do skills connect across fields? |
| Cross-field matrix | http://localhost:4321/guide/#view=matrix | Where does a shared theme appear? |

These three original views use the same content, search, category filters, topic drawer, and saved list. Topic links also work directly, for example `/guide/#view=guide&skill=sql`.

The field guide is the default. The map uses a deterministic, grouped Cytoscape layout with zoom and pan. It has a keyboard-accessible topic index; on small screens the map scrolls within its own area and the index opens by default. The matrix groups topics into four editorial themes.

Saved topics stay in the current browser using local storage. They can be removed individually, downloaded as a text list, or printed with their source content. No account, backend, analytics, or external AI service is involved. If storage is unavailable, the list still works for the current visit. The full source text remains readable without JavaScript.

### Useful decisions after a review

- Which presentation should be the main experience? The three views are alternatives for comparison, not a commitment to maintain all three forever.
- Can a reviewer follow an astronomy example through to a role and another topic without losing their place, especially on a phone?
- Are the proposed connections and theme assignments helpful and defensible? They are suggestions, not prerequisites, qualification scores, or career recommendations.
- Do broad role descriptions belong beside individual skills, or deserve a separate section later?
- Should sparse entries be expanded next, or should the guide first cover more fields?
- Does the astronomy/industry comparison format deserve to become the primary organizing idea?

### Reference notes

These sites informed interaction structure; their content, artwork, and datasets are not copied into the prototypes.

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

The suite covers both prototype generations: desktop/mobile interactions, source equivalents and role connections, search and sector filters, topic readers, mobile focus, persistence, download, deep links, map canvas pixels, direct mouse/touch node selection, zoom, text-based navigation, automated WCAG checks, no-JavaScript source access, and page overflow at 320, 375, 768, 1024, and 1920 pixels. Tests use the reduced-motion preference for stable screenshots and contrast checks. Automated checks do not replace a human accessibility review.

Set `SKILLS_URL` to test another running instance. Review screenshots are generated into the locally ignored `review/` folder; Playwright failure traces go into `test-results/`.

New concept screenshots are named `review/concept-{explorer,roadmap,relationships}-{desktop,mobile}.png`.

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

The public homepage is the atlas, with the development notice above the masthead. The comparison pages remain at `/skills/concepts/`, and the complete original field guide is at `/skills/guide/`.

Project Pages needs the repository subpath. The workflow obtains it from GitHub Pages configuration; to reproduce the production build locally:

```sh
BASE_PATH=/skills/ npm run build
```

The base defaults to `/` for local work. The production origin is configured in `astro.config.mjs`; update that origin and the Pages settings if the repository moves or a custom domain is introduced. Review source changes and editorial relationships before pushing updates to the publication branch.