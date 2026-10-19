/*
    #323 Bars overlap each other
    https://github.com/kerssdead/charts/issues/323
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { PlotAxisType, PlotType } from '@/static/Enums'

test(
    'Bars on plot should has same heights',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.staticMode()

        await Settings.valuesCount(3)
        await Settings.pointsCount(3)
        await Settings.seriesWidth(90)
        await Settings.plotType(PlotType.Bar)
        await Settings.xAxisType(PlotAxisType.Number)

        await Utils.checkRender('df18859c')
    }
)