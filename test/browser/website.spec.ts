import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('documents the package and runs the address demo', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Floating content that keeps its place',
  )
  const input = page.getByRole('combobox', { name: 'Delivery address' })
  await input.fill('Mariahilfer')
  await expect(page.getByRole('listbox')).toBeVisible()
  await page.getByRole('button', { name: 'Show loading' }).click()
  await expect(page.getByText('Searching addresses')).toBeVisible()
  await page.getByRole('button', { name: 'Show 12 results' }).click()
  await expect(page.getByRole('option')).toHaveCount(12)
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
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  )
})
