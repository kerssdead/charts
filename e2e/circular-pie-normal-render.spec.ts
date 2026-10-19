/*
    #380 Pie chart with two sectors rendering in wrong way
    https://github.com/kerssdead/charts/issues/380
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'

test(
    'Circular pie chart should be rendered without any issues',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.staticMode()

        await Settings.valuesCount(2)
        await Settings.chartType(ChartType.Pie)
        await Settings.innerRadius(0)

        await Utils.checkRender('acc8f349')
    }
)