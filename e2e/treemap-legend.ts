/*
    #305 [Tree Map] Disable ability to enable legend
    https://github.com/kerssdead/charts/issues/305
 */

import { expect, test } from '@playwright/test'

test('Tree Map should not has legend', async ({ page }) => {
    await page.goto('https://kerssdead.github.io/charts/')

    const legend = page.locator('#legend'),
        chartType = page.locator('#chart-type')

    await legend.click()

    await chartType.selectOption('3')

    expect(await page.locator('#chart >> *').count()).toBe(1)
})