/*
    #432 Title and gauge labels collide each other
    https://github.com/kerssdead/charts/issues/432
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'

test(
    'Gauge labels should not overlap chart title',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.height(63)

        await Settings.staticMode()
        await Settings.enableTitle()
        await Settings.chartType(ChartType.Gauge)

        await Utils.checkRender('')
    }
)