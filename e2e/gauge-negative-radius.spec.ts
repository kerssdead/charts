/*
    #437 Crash when gauge has negative radius value
    https://github.com/kerssdead/charts/issues/437
 */

import { test } from '@playwright/test'
import Utils from './utils/Utils'
import Settings from './utils/Settings'
import { ChartType } from '../src/static/Enums'

test('Gauge should prevent crash when radius is negative', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.enableInitAnimation(false)

    await Settings.chartType(ChartType.Gauge)
    await Settings.width(10)

    await Utils.checkForErrors()
})