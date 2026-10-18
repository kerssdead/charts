/*
    #395 Test for correct PlotType.Bar mouse hover styles
    https://github.com/kerssdead/charts/issues/395
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType, PlotAxisType, PlotType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Hover styles should be rendered correct for bars in plot chart', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.valuesCount(2)
    await Settings.pointsCount(3)
    await Settings.seriesWidth(90)
    await Settings.chartType(ChartType.Plot)
    await Settings.plotType(PlotType.Bar)
    await Settings.xAxisType(PlotAxisType.Text)

    await page.mouse.move(300, 100)
    await Utils.wait(300)

    await Utils.checkRender(
        '',
        new Clip(84, 127, 30, 20)
    )
})