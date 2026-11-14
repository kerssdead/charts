/*
    #422 Negative values is broken for Plot bar chart
    https://github.com/kerssdead/charts/issues/422
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { PlotType } from '@/static/Enums'

test(
    'Bars on plot should render negative values',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.staticMode()

        await Settings.valuesCount(3)
        await Settings.pointsCount(3)
        await Settings.seriesWidth(90)
        await Settings.enableNegativeValuesInPlot()
        await Settings.plotType(PlotType.Bar)

        await Utils.checkRender('17ca4f70')
    }
)