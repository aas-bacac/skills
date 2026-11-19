import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }) => {
  await page.goto('/guide/');
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
});

test('all topics, photo, and three presentation options render', async ({ page }, testInfo) => {
  await expect(page.locator('.skill-card')).toHaveCount(18);
  await expect(page.getByRole('tab')).toHaveCount(3);
  await expect(page.locator('.astronomy-image img')).toHaveJSProperty('naturalWidth', 840);
  await mkdir('review', { recursive: true });
  await page.screenshot({ path: `review/guide-${testInfo.project.name}.png`, fullPage: true });
});

test('search and category filters can be combined and reset', async ({ page }) => {
  await page.getByRole('navigation', { name: 'Browse skills' }).getByRole('button', { name: /Data science/ }).click();
  await expect(page.locator('.skill-card')).toHaveCount(6);
  await page.getByRole('searchbox').fill('SDSS');
  await expect(page.locator('.skill-card')).toHaveCount(1);
  await expect(page.locator('.skill-card h3')).toHaveText('SQL');
  await page.getByRole('searchbox').fill('no-such-topic');
  await expect(page.getByRole('heading', { name: 'No topics found.' })).toBeVisible();
  await page.getByRole('button', { name: 'Browse all topics' }).click();
  await expect(page.locator('.skill-card')).toHaveCount(18);
});

test('saved topics persist, download, and can be removed', async ({ page }) => {
  await page.getByRole('button', { name: 'Save SQL', exact: true }).click();
  await page.reload();
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await page.getByRole('button', { name: /My exploration list/ }).click();
  await expect(page.locator('.skill-card')).toHaveCount(1);
  await expect(page.locator('.skill-card h3')).toHaveText('SQL');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download exploration list' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('my-skills-exploration.txt');
  expect(await readFile((await download.path())!, 'utf8')).toContain('SQL | Data science');
  await page.getByRole('button', { name: 'Remove SQL from saved topics', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your next direction starts here.' })).toBeVisible();
});

test('topic drawer has source comparisons, connections, and shareable URLs', async ({ page }, testInfo) => {
  await page.getByRole('button', { name: 'Read SQL', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'SQL', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.comparison')).toHaveCount(2);
  await expect(dialog.locator('.comparison.astronomy')).toContainText('SDSS');
  await expect(dialog.locator('.comparison.industry')).toContainText('customers');
  await expect(page).toHaveURL(/skill=sql/);
  await page.screenshot({ path: `review/topic-${testInfo.project.name}.png` });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await page.goto('/guide/#view=guide&skill=sql');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /Metrics dashboards/ }).click();
  await expect(page.getByRole('dialog', { name: 'Metrics dashboards', exact: true })).toBeVisible();
});

test('connection map paints, zooms, and offers an accessible index', async ({ page }, testInfo) => {
  await page.getByRole('tab', { name: 'Connections', exact: true }).click();
  await expect(page.locator('.network-canvas')).toHaveAttribute('data-ready', 'true');
  const paintedPixels = await page.locator('.network-canvas canvas').evaluateAll((canvases) => canvases.reduce((count, element) => {
    const canvas = element as HTMLCanvasElement;
    const context = canvas.getContext('2d');
    if (!context) return count;
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let painted = 0;
    for (let offset = 3; offset < pixels.length; offset += 4) if (pixels[offset] > 0) painted++;
    return count + painted;
  }, 0));
  expect(paintedPixels).toBeGreaterThan(1000);
  const before = await page.locator('.network-canvas').screenshot();
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  const after = await page.locator('.network-canvas').screenshot();
  expect(after.equals(before)).toBe(false);
  await page.getByRole('button', { name: 'Fit map', exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `review/map-${testInfo.project.name}.png`, fullPage: true });
  if (!await page.locator('.map-index').getAttribute('open').then((value) => value !== null)) {
    await page.getByText('Topic index', { exact: false }).click();
  }
  await page.locator('.map-topic-index').getByRole('button', { name: 'SQL', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'SQL', exact: true })).toBeVisible();
});

test('cross-field matrix covers all four themes and opens topics', async ({ page }, testInfo) => {
  await page.getByRole('tab', { name: 'Cross-field', exact: true }).click();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('row')).toHaveCount(5);
  await expect(page.locator('.matrix-topic')).toHaveCount(21);
  await page.screenshot({ path: `review/matrix-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole('button', { name: 'SQL', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'SQL', exact: true })).toBeVisible();
});

test('original document and about text remain available', async ({ page }) => {
  await page.getByRole('button', { name: 'Read the original' }).click();
  await expect(page.getByRole('dialog', { name: 'Original wiki content' })).toContainText('Malmquist bias');
  await page.getByRole('button', { name: 'Close document' }).click();
  await page.getByRole('button', { name: 'About this guide', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'About this guide' })).toContainText('How to use this list');
});

test('all three views and the topic drawer pass automated accessibility checks', async ({ page }) => {
  for (const name of ['Field guide', 'Connections', 'Cross-field']) {
    await page.getByRole('tab', { name, exact: true }).click();
    if (name === 'Connections') await expect(page.locator('.network-canvas')).toHaveAttribute('data-ready', 'true');
    const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(report.violations, JSON.stringify(report.violations.map((entry) => ({ id: entry.id, nodes: entry.nodes.map((node) => node.target) })))).toEqual([]);
  }
  await page.getByRole('tab', { name: 'Field guide', exact: true }).click();
  await page.getByRole('button', { name: 'Read SQL', exact: true }).click();
  const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(report.violations).toEqual([]);
});

test('blocked browser storage does not prevent saving for the current visit', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'setItem', { value() { throw new Error('Storage disabled'); } });
  });
  await page.reload();
  await expect(page.locator('astro-island[ssr]')).toHaveCount(0);
  await expect(page.getByText('Browser storage is unavailable.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Save SQL', exact: true }).click();
  await page.getByRole('button', { name: /My exploration list/ }).click();
  await expect(page.locator('.skill-card')).toHaveCount(1);
});

test('layouts do not overflow the page at narrow, tablet, or wide sizes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop');
  for (const width of [320, 375, 768, 1024, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const name of ['Field guide', 'Connections', 'Cross-field']) {
      await page.getByRole('tab', { name, exact: true }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  }
});

test('the full guide is readable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/guide/`);
  await expect(page.locator('.app-shell')).not.toBeVisible();
  await expect(page.locator('.no-script')).toBeVisible();
  await expect(page.locator('.no-script')).toContainText('Malmquist bias');
  await context.close();
});