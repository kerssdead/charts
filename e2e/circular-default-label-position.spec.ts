/*
    #441 When move mouse from chart canvas to legend one label tooltip has default position
    https://github.com/kerssdead/charts/issues/441
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test(
    'Pie chart tooltip should not be in default position when mouse leave canvas',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.staticMode()

        await Settings.valuesCount(2)
        await Settings.chartType(ChartType.Pie)
        await Settings.enableLegend()
        await Settings.enableTooltip()

        await Utils.scrollToCanvas()
        await Utils.wait(50)

        await Utils.page.mouse.move(600, 500)
        await Utils.wait(400)
        await Utils.page.mouse.move(600, 700, { steps: 3 })

        await Utils.checkRender(
            'baf45eea',
            new Clip(10, 10, 200, 100)
        )
    }
)