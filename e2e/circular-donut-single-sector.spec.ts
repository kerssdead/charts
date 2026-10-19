/*
    #412 Single sector with inner radius renders as filled circle
    https://github.com/kerssdead/charts/issues/412
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'

test(
    'Donut chart with single sector should be rendered with inner radius',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.valuesCount(1)
        await Settings.chartType(ChartType.Pie)
        await Settings.innerRadius(50)

        await Utils.checkRender('588c9830')
    }
)