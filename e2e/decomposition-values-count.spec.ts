/*
    #343 If plot hase series with same name in decomposition to table one of them will be missed
    https://github.com/kerssdead/charts/issues/343
 */

import { expect, test } from '@playwright/test'
import Utils from './utils/Utils'
import Settings from './utils/Settings'
import { ChartType } from '../src/static/Enums'

test('Values with same names should decomposed to separate rows', async ({ page }) => {
    await Utils.setup(page)

    const count = Math.ceil(Math.random() * 10)

    await Settings.valuesCount(count)
    await Settings.customLabel('Same')
    await Settings.chartType(ChartType.Plot)

    await Utils.scrollToCanvas()

    await page.mouse.click(1084, 20)

    await page.waitForTimeout(50)

    await page.mouse.click(1084, 90)

    await page.waitForSelector('dialog')

    expect(await page.locator('dialog .o-table .o-table-row').count())
        .toBe(count)
})