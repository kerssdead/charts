/*
    #428 Test for negative column value
    https://github.com/kerssdead/charts/issues/428
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { PlotType } from '@/static/Enums'

test('Negative values in column plot chart should have negative value', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.staticMode()

    await Settings.plotType(PlotType.Column)
    await Settings.seriesWidth(90)
    await Settings.enableNegativeValuesInPlot()
    await Settings.valuesCount(1)
    await Settings.pointsCount(3)

    await Utils.checkRender(
        ''
    )
})