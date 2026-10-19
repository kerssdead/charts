/*
    #439 Legend can't be bigger than chart canvas
    https://github.com/kerssdead/charts/issues/439
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'

test(
    'Legend should not be bigger than chart canvas',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.staticMode()

        await Settings.valuesCount(400)
        await Settings.chartType(ChartType.Pie)
        await Settings.enableLegend()

        await Utils.checkRender('bdfcd52c')
    }
)