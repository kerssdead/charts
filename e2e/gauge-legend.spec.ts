/*
    #293 [Gauge] If legend is enabled never render it and warn in console what legend is not available for Gauge chart
    https://github.com/kerssdead/charts/issues/293
 */

import { expect, test } from '@playwright/test'

test('Tree Map should not has legend', async ({ page }) => {
    await page.goto('/charts/')

    const legend = page.locator('#legend'),
        chartType = page.locator('#chart-type')

    await legend.click()

    await chartType.selectOption('2')

    expect(await page.locator('#chart >> *').count()).toBe(1)
})