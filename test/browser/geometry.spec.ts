import { expect, test, type Page } from '@playwright/test'

async function verticalGap(page: Page): Promise<number> {
  return page.evaluate(() => {
    const anchor = document.querySelector('[data-testid="anchor"]')
    const layer = document.querySelector('[data-testid="layer"]')
    if (!(anchor instanceof HTMLElement) || !(layer instanceof HTMLElement)) {
      throw new Error('fixture elements are missing')
    }
    const anchorRect = anchor.getBoundingClientRect()
    const layerRect = layer.getBoundingClientRect()
    return layer.dataset.side === 'top'
      ? anchorRect.top - layerRect.bottom
      : layerRect.top - anchorRect.bottom
  })
}

test('first visible position is valid', async ({ page }) => {
  await page.goto('/?fixture=basic')
  const layer = page.getByTestId('layer')
  await expect(layer).toHaveAttribute('data-positioned', 'true')
  await expect(layer).toBeVisible()
  expect(Math.abs((await verticalGap(page)) - 6)).toBeLessThanOrEqual(1)
  expect(
    await layer.evaluate((node) => node.getBoundingClientRect().width),
  ).toBe(
    await page
      .getByTestId('anchor')
      .evaluate((node) => node.getBoundingClientRect().width),
  )
})

test('tracks nested scroll and layout shift', async ({ page }) => {
  await page.goto('/?fixture=scroll')
  await expect(page.getByTestId('layer')).toHaveAttribute(
    'data-positioned',
    'true',
  )
  const before = await verticalGap(page)
  await page.getByTestId('scroller').evaluate((node) => {
    node.scrollTop = 160
  })
  await expect.poll(() => verticalGap(page)).toBeCloseTo(before, 0)
  await page.getByRole('button', { name: 'Add validation message' }).click()
  await expect.poll(() => verticalGap(page)).toBeCloseTo(before, 0)
})

test('content growth updates available height and may flip', async ({
  page,
}) => {
  await page.goto('/?fixture=collision')
  const layer = page.getByTestId('layer')
  await expect(layer).toHaveAttribute('data-positioned', 'true')
  await page.getByRole('button', { name: 'Show twelve results' }).click()
  await expect(layer).toHaveAttribute('data-side', 'top')
  const availableHeight = await layer.evaluate((node) =>
    Number.parseFloat(
      getComputedStyle(node).getPropertyValue(
        '--anchored-layer-available-height',
      ),
    ),
  )
  expect(availableHeight).toBeGreaterThan(0)
})

test('start alignment respects RTL', async ({ page }) => {
  await page.goto('/?fixture=rtl')
  await expect(page.getByTestId('layer')).toHaveAttribute(
    'data-positioned',
    'true',
  )
  const edges = await page.evaluate(() => {
    const anchor = document.querySelector('[data-testid="anchor"]')
    const layer = document.querySelector('[data-testid="layer"]')
    if (!(anchor instanceof HTMLElement) || !(layer instanceof HTMLElement)) {
      throw new Error('fixture elements are missing')
    }
    return {
      anchor: anchor.getBoundingClientRect().right,
      layer: layer.getBoundingClientRect().right,
    }
  })
  expect(Math.abs(edges.anchor - edges.layer)).toBeLessThanOrEqual(1)
  await expect(page.getByTestId('layer')).toHaveCSS('direction', 'rtl')
  expect(
    await page
      .getByTestId('layer')
      .evaluate((node) =>
        node.style.getPropertyValue('--anchored-layer-transform-origin'),
      ),
  ).toBe('right top')
  await page.getByRole('button', { name: 'Toggle direction' }).click()
  await expect(page.getByTestId('layer')).toHaveCSS('direction', 'ltr')
  await expect
    .poll(() =>
      page.evaluate(() => {
        const anchor = document.querySelector('[data-testid="anchor"]')
        const layer = document.querySelector('[data-testid="layer"]')
        if (!(anchor instanceof HTMLElement) || !(layer instanceof HTMLElement))
          throw new Error('Missing layer')
        return Math.abs(
          anchor.getBoundingClientRect().left -
            layer.getBoundingClientRect().left,
        )
      }),
    )
    .toBeLessThanOrEqual(1)
  expect(
    await page
      .getByTestId('layer')
      .evaluate((node) =>
        node.style.getPropertyValue('--anchored-layer-transform-origin'),
      ),
  ).toBe('left top')
})

test('origin follows automatic and CSS direction on the content', async ({
  page,
}) => {
  await page.goto('/?fixture=direction')
  const layer = page.getByTestId('layer')
  const origin = () =>
    layer.evaluate((node) =>
      node.style.getPropertyValue('--anchored-layer-transform-origin'),
    )
  for (const mode of ['auto', 'class']) {
    if (mode === 'class')
      await page.getByRole('button', { name: 'Use CSS direction' }).click()
    await expect(layer).toHaveCSS('direction', 'rtl')
    await expect.poll(origin).toBe('right top')
    await expect
      .poll(() =>
        page.evaluate(() => {
          const anchor = document.querySelector('[data-testid="anchor"]')
          const content = document.querySelector('[data-testid="layer"]')
          if (
            !(anchor instanceof HTMLElement) ||
            !(content instanceof HTMLElement)
          )
            throw new Error('Missing layer')
          return Math.abs(
            anchor.getBoundingClientRect().right -
              content.getBoundingClientRect().right,
          )
        }),
      )
      .toBeLessThanOrEqual(1)
  }
  await page.getByRole('button', { name: 'Use LTR direction' }).click()
  await expect(layer).toHaveCSS('direction', 'ltr')
  await expect.poll(origin).toBe('left top')
})
