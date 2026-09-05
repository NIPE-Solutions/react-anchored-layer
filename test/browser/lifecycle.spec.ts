import { expect, test } from '@playwright/test'

test('rapid open and close leaves one current portal', async ({ page }) => {
  await page.goto('/?fixture=lifecycle')
  const toggle = page.getByRole('button', { name: 'Toggle layer' })
  await toggle.click()
  await toggle.click()
  await toggle.click()
  await expect(page.getByTestId('layer')).toHaveCount(1)
  await expect(page.getByTestId('layer')).toHaveAttribute(
    'data-positioned',
    'true',
  )
})

test('anchor unmount removes open content', async ({ page }) => {
  await page.goto('/?fixture=lifecycle')
  await page.getByRole('button', { name: 'Toggle layer' }).click()
  await expect(page.getByTestId('layer')).toHaveAttribute(
    'data-positioned',
    'true',
  )
  await page.getByRole('button', { name: 'Remove anchor' }).click()
  await expect(page.getByTestId('layer')).toHaveCount(0)
})
