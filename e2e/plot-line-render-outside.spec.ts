/*
    #458 Series should not render outside plot
    https://github.com/kerssdead/charts/issues/458
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { PlotType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Plot chart should not renders outside plot', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.valuesCount(1)
    await Settings.pointsCount(20)
    await Settings.seriesWidth(100)
    await Settings.plotType(PlotType.Line)

    await Utils.checkRender(
        '',
        new Clip(883, 261, 10, 210)
    )
})