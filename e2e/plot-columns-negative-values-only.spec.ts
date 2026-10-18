/*
    #429 When all column values is negative nothing will be rendered
    https://github.com/kerssdead/charts/issues/429
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { PlotType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Only negative values in column plot chart should be render correctly', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.enableInitAnimation(false)

    await Settings.plotType(PlotType.Column)
    await Settings.seriesWidth(90)
    await Settings.enableNegativeValuesInPlot()
    await Settings.valuesCount(1)
    await Settings.pointsCount(7)

    await Settings.seed(189)

    await Utils.checkRender(
        '',
        new Clip(0, 0, 928, 406)
    )
})