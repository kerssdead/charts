/*
    #426 Test for big numbers overflow canvas
    https://github.com/kerssdead/charts/issues/426
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { PlotType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Big numbers should not overlap y-axis title and should be in canvas', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.enableInitAnimation(false)

    await Settings.plotType(PlotType.Column)
    await Settings.baseValue(12345678)
    await Settings.yAxisTitle()
    await Settings.seriesWidth(90)

    await Utils.checkRender(
        '',
        new Clip(0, 0, 140, 720)
    )
})