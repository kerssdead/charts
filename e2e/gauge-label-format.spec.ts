/*
    #327 Labels is not rounded
    https://github.com/kerssdead/charts/issues/327
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Gauge labels should be formatted', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.staticMode()
    await Settings.gaugeMax(99)
    await Settings.chartType(ChartType.Gauge)

    await Utils.checkRender(
        '',
        new Clip(71, 659, 36, 20)
    )
})