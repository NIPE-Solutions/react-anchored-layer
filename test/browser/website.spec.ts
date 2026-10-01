import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('homepage support links follow the demo and remain usable at mobile sizes', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  const support = page.getByRole('region', { name: 'Useful in your project?' })
  await expect(support).toBeVisible()
  await expect(
    support.getByRole('heading', { level: 2, name: 'Useful in your project?' }),
  ).toBeVisible()
  expect(
    await support.evaluate((element) =>
      element.previousElementSibling?.matches('.hero'),
    ),
  ).toBe(true)
  const links = [
    [
      'Star on GitHub',
      'https://github.com/NIPE-Solutions/react-anchored-layer',
    ],
    ['Explore NIPE Open Source', 'https://opensource.nipesolutions.com'],
  ] as const
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await support.screenshot({
      path: testInfo.outputPath(`support-${width.toString()}.png`),
    })
    for (const [name, href] of links) {
      const link = support.getByRole('link', { name, exact: true })
      await expect(link).toHaveAttribute('href', href)
      await link.focus()
      await expect(link).toBeFocused()
      await expect(link).toHaveCSS('outline-style', 'solid')
      const bounds = await link.boundingBox()
      expect(bounds?.height).toBeGreaterThanOrEqual(44)
      expect(bounds?.width).toBeGreaterThanOrEqual(44)
      expect(bounds?.x).toBeGreaterThanOrEqual(0)
      expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(width)
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width)
  }
})

test('documents the package and runs the address demo', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Floating content that stays attached',
  )
  const hero = page.getByRole('region', { name: 'Anchored layer playground' })
  const input = hero.getByRole('combobox', { name: 'Delivery address' })
  await input.fill('Mariahilfer')
  await expect(hero.getByRole('listbox')).toBeVisible()
  await expect(hero.getByText('portal target: modal root')).toBeVisible()
  await expect(hero.getByText('7px offset')).toBeVisible()
  await hero.getByRole('button', { name: 'Show loading' }).click()
  await expect(hero.getByText('Searching addresses')).toBeVisible()
  await hero.getByRole('button', { name: 'Show 12 results' }).click()
  await expect(hero.getByRole('option')).toHaveCount(12)
})

test('stress demo exercises real positioning failure cases', async ({
  page,
}) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') pageErrors.push(message.text())
  })
  await page.goto('/#stress-test')
  const stress = page.getByRole('region', { name: 'Positioning stress test' })

  await expect(stress.getByRole('listbox')).toBeVisible()
  await stress.getByRole('button', { name: 'Add result' }).click()
  await expect(stress.getByRole('listbox').getByRole('option')).toHaveCount(4)
  await stress.getByRole('button', { name: 'Toggle loading' }).click()
  await expect(stress.getByRole('status')).toContainText('Loading results')
  await stress.getByRole('button', { name: 'Toggle loading' }).click()
  await stress.getByRole('button', { name: 'Resize modal' }).click()
  await expect(stress.getByText('compact container')).toBeVisible()
  await stress.getByRole('button', { name: 'Move anchor' }).click()
  await stress.getByRole('button', { name: 'Toggle RTL' }).click()
  await expect(stress).toHaveAttribute('dir', 'rtl')
  await stress
    .getByRole('combobox', { name: 'Requested placement' })
    .selectOption('top-start')
  await expect(stress.getByText('requested: top-start')).toBeVisible()
  expect(pageErrors).toEqual([])
})

test('documents portal strategy trade-offs', async ({ page }) => {
  await page.goto('/#portal-model')
  const portalSection = page.locator('#portal-model')
  await expect(
    portalSection.getByRole('heading', { name: 'Body portal' }),
  ).toBeVisible()
  await expect(
    portalSection.getByRole('heading', { name: 'Custom modal portal root' }),
  ).toBeVisible()
  await expect(
    portalSection.getByRole('heading', { name: 'Local rendering' }),
  ).toBeVisible()
})

test('has no automatically detectable accessibility violations', async ({
  page,
}) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('keeps documentation usable on a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Anchored layer playground' }),
  ).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
})
