/*
    #322 Title is not displaying
    https://github.com/kerssdead/charts/issues/322
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Plot title should be rendered', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.staticMode()

    await Settings.enableTitle()
    await Settings.enableLegend()
    await Settings.chartType(ChartType.Plot)

    await Utils.checkRender(
        '',
        new Clip(440, 10, 48, 30)
    )
})