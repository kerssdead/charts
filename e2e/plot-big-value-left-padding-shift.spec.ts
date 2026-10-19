/*
    #426 Test for big numbers overflow canvas
    https://github.com/kerssdead/charts/issues/426
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { PlotType } from '@/static/Enums'

test(
    'Big numbers should not overlap y-axis title and should be in canvas',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.staticMode()

        await Settings.plotType(PlotType.Column)
        await Settings.baseValue(12345678)
        await Settings.yAxisTitle()
        await Settings.seriesWidth(90)

        await Utils.checkRender('88142b9b')
    }
)