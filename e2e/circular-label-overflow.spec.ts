/*
    #363 Label renders outside bounds of canvas
    https://github.com/kerssdead/charts/issues/363
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import * as Constants from '@/static/constants/Index'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Label should not be rendered', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.valuesCount(5)
    await Settings.chartType(ChartType.Pie)
    await Settings.innerRadius(0)

    await Settings.seed(14324324)

    await Utils.scrollToCanvas()

    await page.mouse.move(544, 136)

    await page.waitForTimeout(Constants.AnimationTiming.hover)

    await Utils.checkRender(
        '',
        new Clip(350, 0, 90, 12)
    )
})