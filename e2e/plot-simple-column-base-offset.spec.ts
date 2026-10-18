/*
    #358 Base offsets is still calculate for simple mode
    https://github.com/kerssdead/charts/issues/358
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType, PlotType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Simple plot offsets should be minimal', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.enableSimple()
    await Settings.valuesCount(3)
    await Settings.pointsCount(6)
    await Settings.seriesWidth(95)
    await Settings.chartType(ChartType.Plot)
    await Settings.plotType(PlotType.Column)

    await Utils.checkRender(
        '',
        new Clip(0, 688, 32, 32)
    )

    await Utils.checkRender(
        '',
        new Clip(896, 688, 32, 32)
    )
})