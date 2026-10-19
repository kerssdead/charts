/*
    #439 Legend can't be bigger than chart canvas
    https://github.com/kerssdead/charts/issues/439
 */

import { expect, test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'

test('Legend should not be bigger than chart canvas', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.staticMode()

    await Settings.valuesCount(400)
    await Settings.chartType(ChartType.Pie)
    await Settings.enableLegend()

    const chart = await page.locator('#chart canvas:first-of-type').boundingBox(),
        legend = await page.locator('#chart canvas:last-of-type').boundingBox()

    expect(chart && legend ? (chart.height > legend.height) : false)
        .toBe(true)
})