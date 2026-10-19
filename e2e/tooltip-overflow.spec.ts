/*
    #364 Label bounds calculates in wrong way
    https://github.com/kerssdead/charts/issues/364
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import * as Constants from '@/static/constants/Index'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Regular tooltip should not overflow canvas', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.enableTooltip()
    await Settings.valuesCount(1)
    await Settings.chartType(ChartType.TreeMap)
    await Settings.treePadding(0)

    await Utils.scrollToCanvas()

    await page.mouse.move(760, 710)

    await page.waitForTimeout(Constants.Tooltip.fadeDuration * 3)

    await Utils.checkRender(
        '',
        new Clip(579, 688, 150, 32)
    )
})