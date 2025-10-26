/*
    #293 [Gauge] If legend is enabled never render it and warn in console what legend is not available for Gauge chart
    https://github.com/kerssdead/charts/issues/293
 */

import { expect, test } from '@playwright/test'
import Utils from './utils/Utils'
import Settings from './utils/Settings'
import { ChartType } from '../src/static/Enums'

test('Gauge should not has legend', async ({ page }) => {
    await Utils.setup(page)

    await Settings.enableLegend()
    await Settings.chartType(ChartType.Gauge)

    expect(await page.locator('#chart >> *').count())
        .toBe(1)
})