/*
    #367 X-axis labels overlap each other
    https://github.com/kerssdead/charts/issues/367
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType, PlotAxisType, PlotType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Label should not overlap each other', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.valuesCount(5)
    await Settings.chartType(ChartType.Plot)
    await Settings.plotType(PlotType.Bar)
    await Settings.xAxisType(PlotAxisType.Text)

    await Utils.checkRender(
        '',
        new Clip(24, 680, 384, 20)
    )
})