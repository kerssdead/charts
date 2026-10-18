/*
    #406 Chart with single section can't be rendere
    https://github.com/kerssdead/charts/issues/406
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'

test('Circular pie chart should be rendered without any issues', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.valuesCount(1)
    await Settings.chartType(ChartType.Pie)
    await Settings.innerRadius(0)

    await Utils.checkRender(
        ''
    )
})