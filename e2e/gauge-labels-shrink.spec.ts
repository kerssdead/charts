/*
    #423 Test for label overflow canvas
    https://github.com/kerssdead/charts/issues/423
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Gauge labels should not be shrunk when width is half of 100%', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.enableInitAnimation(false)

    await Settings.chartType(ChartType.Gauge)
    await Settings.width(70)

    await Utils.checkRender(
        '',
        new Clip(180, 420, 568, 300)
    )
})