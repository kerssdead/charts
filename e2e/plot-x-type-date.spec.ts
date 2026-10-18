/*
    #342 First date in plot x-axis is Invalid date
    https://github.com/kerssdead/charts/issues/342
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType, PlotAxisType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Plot with x-axis types is date first date shouldn`t be "Invalid Date"', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.enableLegend()
    await Settings.enableTitle()
    await Settings.chartType(ChartType.Plot)
    await Settings.xAxisType(PlotAxisType.Date)

    await Utils.checkRender(
        '',
        new Clip(61, 634, 80, 22)
    )
})