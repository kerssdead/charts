import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'

test(
    'Circular donut chart should be rendered without any issues',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.staticMode()

        await Settings.valuesCount(2)
        await Settings.chartType(ChartType.Pie)
        await Settings.innerRadius(50)

        await Utils.checkForErrors()

        await Utils.checkRender('8237846d')
    }
)