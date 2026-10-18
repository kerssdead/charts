/*
    #347 -0 value can be calculated in y-axis labels
    https://github.com/kerssdead/charts/issues/347
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Zero y-axis label shouldn`t be negative', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.enableNegativeValuesInPlot()
    await Settings.valuesCount(1)
    await Settings.pointsCount(6)
    await Settings.chartType(ChartType.Plot)
    await Settings.seed(179)

    await Utils.checkRender(
        '',
        new Clip(37, 338, 39, 23)
    )
})