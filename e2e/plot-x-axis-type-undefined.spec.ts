/*
    #383 X-axis labels not displaying
    https://github.com/kerssdead/charts/issues/383
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Plot with undefined x-axis type should render default label instead of empty', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.enableInitAnimation(false)
    await Settings.enableLegend()
    await Settings.enableTitle()
    await Settings.chartType(ChartType.Plot)
    await Settings.xAxisType()

    await Utils.checkRender(
        '',
        new Clip(88, 624, 812, 48)
    )
})