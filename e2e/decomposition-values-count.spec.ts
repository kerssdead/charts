/*
    #343 If plot hase series with same name in decomposition to table one of them will be missed
    https://github.com/kerssdead/charts/issues/343
 */

import { expect, test } from '@playwright/test'
import { Utils } from './utils/Utils'

test('Values with same names should decomposed to separate rows', async ({ page }) => {
    await Utils.goto(page)

    const chartType = page.locator('#chart-type'),
        customLabel = page.locator('#custom-label'),
        valuesCount = page.locator('#values-count')

    const count = Math.ceil(Math.random() * 10)

    await valuesCount.fill(count.toString())
    await customLabel.fill('Same')
    await chartType.selectOption('0')

    const chart = page.locator('#chart')

    await chart.scrollIntoViewIfNeeded()

    await chart.click()

    await page.mouse.click(1084, 20)

    await page.waitForTimeout(50)

    await page.mouse.click(1084, 90)

    await page.waitForSelector('dialog')

    expect(await page.locator('dialog tbody tr').count())
        .toBe(count)
})