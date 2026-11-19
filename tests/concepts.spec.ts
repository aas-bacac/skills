import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

const routes = ['explorer', 'roadmap', 'relationships'] as const;

test('homepage opens the atlas with a prominent development notice', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Skills & careers atlas');
  await expect(page.locator('.c-brand')).toHaveText('BACAC');
  await expect(page.locator('.c-brand-initial')).toHaveCount(0);
  const notice = page.getByRole('complementary', { name: 'Development status' });
  await expect(notice).toBeVisible();
  await expect(notice).toContainText('(Under development)');
  expect((await notice.boundingBox())!.y).toBeLessThan(30);
  await expect(page.locator('.atlas-network')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('combobox', { name: 'Your astronomy experience' }).selectOption('communication');
  await expect(page.getByRole('navigation', { name: 'Connected careers' }).getByRole('button')).toHaveCount(2);
});

test('separate alternatives are linked for comparison', async ({ page }) => {
  await page.goto('/concepts/');
  for (const route of routes) await expect(page.locator(`.concept-option a[href$="/${route}/"]`).first()).toBeVisible();
  await expect(page.locator('.concept-option')).toHaveCount(3);
});

test('career cards connect astronomy experience, source equivalents, roles, and further topics', async ({ page }, testInfo) => {
  await page.goto('/concepts/explorer/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await expect(page.locator('.translation-astronomy')).toContainText('SDSS');
  await expect(page.locator('.translation-industry')).toContainText('customers');
  await expect(page.locator('.career-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Explore data analyst', exact: true }).click();
  if (testInfo.project.name === 'mobile') await expect(page.locator('.career-detail')).toBeFocused();
  await page.locator('.career-detail').getByRole('button', { name: 'Metrics dashboards' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('Industry');
  await page.getByRole('button', { name: 'Close topic', exact: true }).click();
  await page.getByRole('radio', { name: /Explain technical findings/ }).check();
  await expect(page.locator('.career-card')).toHaveCount(2);
  await expect(page.locator('.career-detail h2')).toHaveText('Systems engineer');
  await expect(page.locator('.career-detail')).toContainText('A role description has not yet been added');
  await expect(page).toHaveURL(/experience=communication/);
  await page.reload();
  await expect(page.getByRole('radio', { name: /Explain technical findings/ })).toBeChecked();
  await expect(page.locator('.career-card')).toHaveCount(2);
});

test('career search, sector filters, and empty states work together', async ({ page }) => {
  await page.goto('/concepts/explorer/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await page.getByRole('checkbox', { name: 'Connected to this experience' }).uncheck();
  await expect(page.locator('.career-card')).toHaveCount(7);
  await page.getByRole('combobox', { name: 'Career sector' }).selectOption('Aerospace');
  await expect(page.locator('.career-card')).toHaveCount(2);
  await page.getByRole('searchbox').fill('zz-no-match');
  await expect(page.getByRole('heading', { name: 'No matching careers' })).toBeVisible();
  await page.getByRole('button', { name: 'Show all seven roles' }).click();
  await expect(page.locator('.career-card')).toHaveCount(7);
  await page.getByRole('searchbox').fill('SDSS');
  await expect(page.locator('.career-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(page.locator('.career-card')).toHaveCount(7);
});

test('roadmap changes career paths and opens actual wiki topic detail', async ({ page }, testInfo) => {
  await page.goto('/concepts/roadmap/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Data analyst');
  await expect(page.locator('.roadmap-detail .translation-astronomy')).toContainText('SDSS');
  await page.locator('.roadmap-map').getByRole('button', { name: 'Metrics dashboards', exact: true }).click();
  await expect(page.locator('.roadmap-detail h2')).toHaveText('Metrics dashboards');
  if (testInfo.project.name === 'mobile') await expect(page.locator('.roadmap-detail')).toBeFocused();
  await page.getByRole('button', { name: 'Read full wiki entry' }).click();
  await expect(page.getByRole('dialog')).toContainText('Industry');
  await page.getByRole('button', { name: 'Close topic' }).click();
  await page.getByRole('navigation', { name: 'Career paths' }).getByRole('button', { name: 'Systems engineer', exact: true }).click();
  await page.getByRole('combobox', { name: 'Your astronomy experience' }).selectOption('communication');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Systems engineer');
  await expect(page.locator('.roadmap-relation-state')).toContainText('A connection');
  await expect(page.locator('.roadmap-map')).toContainText('Modeling techniques');
  await expect(page.locator('.roadmap-detail h2')).toHaveText('Technical communication');
  await page.locator('.roadmap-next').getByRole('button', { name: 'Modeling techniques', exact: true }).click();
  await expect(page.locator('.roadmap-detail h2')).toHaveText('Modeling techniques');
});

test('atlas paints, zooms, filters, and supports its complete text-based selection path', async ({ page }, testInfo) => {
  await page.goto('/concepts/relationships/');
  await expect(page.locator('.atlas-network')).toHaveAttribute('data-ready', 'true');
  const canvas = page.locator('.atlas-canvas');
  if (testInfo.project.name === 'desktop') {
    await expect(canvas).toHaveAttribute('data-ready', 'true');
    const pixels = await canvas.locator('canvas').evaluateAll((elements) => elements.reduce((sum, element) => {
      const canvasElement = element as HTMLCanvasElement;
      const context = canvasElement.getContext('2d');
      if (!context) return sum;
      const data = context.getImageData(0, 0, canvasElement.width, canvasElement.height).data;
      let painted = 0;
      for (let offset = 3; offset < data.length; offset += 4) if (data[offset] > 0) painted++;
      return sum + painted;
    }, 0));
    expect(pixels).toBeGreaterThan(1000);
    const initial = await canvas.screenshot();
    await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
    expect((await canvas.screenshot()).equals(initial)).toBe(false);
    await page.getByRole('button', { name: 'Fit atlas', exact: true }).click();
  } else {
    await expect(page.locator('.atlas-mobile-careers button')).toHaveCount(3);
    await expect(page.getByRole('button', { name: 'Zoom in', exact: true })).toHaveCount(0);
  }
  await expect(page.getByRole('navigation', { name: 'Connected careers' }).getByRole('button')).toHaveCount(3);
  await page.getByRole('combobox', { name: 'Your astronomy experience' }).selectOption('communication');
  await expect(page.getByRole('navigation', { name: 'Connected careers' }).getByRole('button')).toHaveCount(2);
  await page.getByRole('navigation', { name: 'Connected careers' }).getByRole('button', { name: 'Test engineer', exact: true }).click();
  await expect(page.locator('.atlas-role-detail h3')).toHaveText('Test engineer');
  await page.locator('.atlas-role-detail').getByRole('button', { name: 'Modeling techniques' }).click();
  await expect(page.getByRole('dialog')).toContainText('Monte Carlo');
  await page.getByRole('button', { name: 'Close topic' }).click();
  await page.getByRole('checkbox', { name: 'Selected connections only' }).check();
  await expect(page.locator('.atlas-network')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.atlas-translation')).toContainText('Communication');
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('checkbox', { name: 'Selected connections only' }).uncheck();
    await expect(page.locator('.atlas-mobile-path')).toHaveCount(7);
    await page.getByRole('checkbox', { name: 'Selected connections only' }).check();
    await expect(page.locator('.atlas-mobile-path')).toHaveCount(1);
  }
});

test('atlas career nodes can be selected directly on the canvas or mobile diagram', async ({ page }, testInfo) => {
  await page.goto('/concepts/relationships/');
  await expect(page.locator('.atlas-network')).toHaveAttribute('data-ready', 'true');
  if (testInfo.project.name === 'mobile') {
    await page.locator('.atlas-mobile-careers').getByRole('button', { name: 'Data scientist', exact: true }).tap();
    await expect(page.locator('.atlas-inspector')).toBeFocused();
  } else {
    const canvas = page.locator('.atlas-canvas');
    await expect(canvas).toHaveAttribute('data-ready', 'true');
    const bounds = (await canvas.boundingBox())!;
    const zoom = Math.min((bounds.width - 50) / 775, (bounds.height - 50) / 612);
    await canvas.click({ position: { x: bounds.width / 2 + 290 * zoom, y: bounds.height / 2 - 184 * zoom } });
  }
  await expect(page.locator('.atlas-role-detail h3')).toHaveText('Data scientist');
  await expect(page.getByRole('navigation', { name: 'Connected careers' }).getByRole('button', { name: 'Data scientist', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('atlas cards cannot be dragged out of position', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  await page.goto('/');
  const canvas = page.locator('.atlas-canvas');
  await expect(canvas).toHaveAttribute('data-ready', 'true');
  await canvas.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const before = await canvas.screenshot();
  const bounds = (await canvas.boundingBox())!;
  const zoom = Math.min((bounds.width - 50) / 775, (bounds.height - 50) / 612);
  const node = { x: bounds.x + bounds.width / 2 + 290 * zoom, y: bounds.y + bounds.height / 2 - 184 * zoom };
  await page.mouse.move(node.x, node.y);
  await page.mouse.down();
  await page.mouse.move(node.x - 100, node.y + 100, { steps: 10 });
  await page.mouse.up();
  await page.mouse.move(0, 0);
  expect((await canvas.screenshot()).equals(before)).toBe(true);
});

test('mobile swipes over atlas cards and background scroll the page', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/');
  await expect(page.locator('.atlas-network')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('.atlas-canvas')).toHaveCount(0);
  const session = await page.context().newCDPSession(page);
  for (const overCard of [false, true]) {
    await page.evaluate(() => window.scrollTo(0, 0));
    const card = page.locator('.atlas-mobile-node.industry');
    await card.scrollIntoViewIfNeeded();
    const bounds = (await card.boundingBox())!;
    const start = { x: overCard ? bounds.x + bounds.width / 2 : 5, y: bounds.y + bounds.height / 2 };
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [start] });
    for (const offset of [30, 70, 120, 180]) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x, y: start.y - offset }] });
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => page.evaluate(() => window.scrollY), { message: `Swipe over ${overCard ? 'a card' : 'background'} should scroll the page` }).toBeGreaterThan(scrollBefore + 70);
    await expect(page.getByRole('dialog')).not.toBeVisible();
  }
  await session.detach();
});

test('mobile atlas text and controls are comfortably sized', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  await page.goto('/');
  await expect(page.locator('.atlas-network')).toHaveAttribute('data-ready', 'true');
  for (const width of [320, 390, 844]) {
    await page.setViewportSize({ width, height: 844 });
    const text = await page.locator('.atlas-toolbar select, .atlas-mobile-node strong, .atlas-role-detail > p, .atlas-translation .c-prose').evaluateAll(elements => elements.map(element => parseFloat(getComputedStyle(element).fontSize)));
    expect(text.every(size => size >= 16), `Text should be readable at ${width}px`).toBe(true);
    const targets = await page.locator('.atlas-toolbar select, .atlas-toolbar .c-checkbox, .atlas-mobile-node, .atlas-career-index button, .atlas-role-detail .c-topic-links button').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().height));
    expect(targets.every(height => height >= 44), `Controls should have comfortable touch targets at ${width}px`).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('checkbox', { name: 'Selected connections only' }).uncheck();
    await expect(page.locator('.atlas-mobile-path')).toHaveCount(7);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('checkbox', { name: 'Selected connections only' }).check();
  }
});

test('standalone prototypes and their topic dialogs pass automated accessibility checks', async ({ page }) => {
  for (const route of routes) {
    await page.goto(`/concepts/${route}/`);
    await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
    if (route === 'relationships') await expect(page.locator('.atlas-network')).toHaveAttribute('data-ready', 'true');
    const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(report.violations, JSON.stringify(report.violations.map((entry) => ({ id: entry.id, nodes: entry.nodes.map((node) => node.target) })))).toEqual([]);
    if (route === 'roadmap') await page.getByRole('button', { name: 'Read full wiki entry' }).click();
    else await page.locator(route === 'explorer' ? '.career-detail' : '.atlas-role-detail').getByRole('button', { name: 'Metrics dashboards' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const dialogReport = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(dialogReport.violations, JSON.stringify(dialogReport.violations.map((entry) => ({ id: entry.id, nodes: entry.nodes.map((node) => node.target) })))).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  }
});

test('standalone prototypes render without errors and produce desktop/mobile review screenshots', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await mkdir('review', { recursive: true });
  for (const route of routes) {
    await page.goto(`/concepts/${route}/`);
    await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
    if (route === 'relationships') await expect(page.locator('.atlas-network')).toHaveAttribute('data-ready', 'true');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `review/concept-${route}-${testInfo.project.name}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('every astronomy entry point retains equivalents and related careers in each concept', async ({ page }) => {
  for (const route of routes) {
    await page.goto(`/concepts/${route}/#experience=models`);
    await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
    if (route === 'explorer') {
      await expect(page.locator('.career-card')).toHaveCount(4);
      await page.getByRole('radio', { name: /Model a physical system/ }).check();
      await expect(page.locator('.career-card')).toHaveCount(2);
      await expect(page.locator('.career-detail')).toContainText('Systems engineer');
    } else {
      await expect(page.getByRole('combobox', { name: 'Your astronomy experience' })).toHaveValue('models');
      for (const id of ['catalogs', 'measurements', 'models', 'collaboration', 'software', 'communication', 'modeling']) {
        await page.getByRole('combobox', { name: 'Your astronomy experience' }).selectOption(id);
        if (route === 'relationships') await expect(page.getByRole('navigation', { name: 'Connected careers' }).getByRole('button').first()).toBeVisible();
        else await expect(page.locator('.roadmap-detail .translation h2')).not.toBeEmpty();
      }
    }
    await expect(page.locator('.translation .c-prose').first()).not.toBeEmpty();
  }
});

test('without JavaScript each concept leads to the full readable source', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const route of routes) {
    await page.goto(`${baseURL}/concepts/${route}/`);
    await expect(page.locator('.c-no-script')).toBeVisible();
    await expect(page.locator('astro-island')).not.toBeVisible();
    await page.getByRole('link', { name: 'Read the complete source guide' }).click();
    await expect(page.locator('.no-script')).toContainText('Malmquist bias');
  }
  await context.close();
});

test('all prototype layouts fit phone, tablet, laptop, and large desktop widths', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  for (const width of [320, 375, 768, 1024, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(`/concepts/${route}/`);
      await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `${route} overflows at ${width}px`).toBe(true);
    }
  }
});