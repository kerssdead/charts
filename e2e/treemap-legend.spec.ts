/*
    #305 [Tree Map] Disable ability to enable legend
    https://github.com/kerssdead/charts/issues/305
 */

import { expect, test } from '@playwright/test'
import { Utils } from './utils/Utils'
import Settings from './utils/Settings'
import { ChartType } from '../src/static/Enums'

test('Tree Map should not has legend', async ({ page }) => {
    await Utils.setup(page)

    await Settings.enableLegend()
    await Settings.chartType(ChartType.TreeMap)

    expect(await page.locator('#chart >> *').count())
        .toBe(1)
})