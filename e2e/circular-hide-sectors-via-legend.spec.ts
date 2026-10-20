/*
    #433 Disabled data still displaying on chart
    https://github.com/kerssdead/charts/issues/433
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test(
    'Pie chart sectors should not be rendered after disabled in legend',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.staticMode()

        await Settings.chartType(ChartType.Pie)
        await Settings.enableLegend()
        await Settings.valuesCount(10)

        await Utils.scrollToCanvas()
        await Utils.page.mouse.click(0, 0)

        const timeAfterClick = 20

        const topRow = 680
        const bottomRow = 710

        await Utils.wait(timeAfterClick)
        await Utils.page.mouse.click(320, topRow)
        await Utils.wait(timeAfterClick)
        await Utils.page.mouse.click(420, topRow)
        await Utils.wait(timeAfterClick)
        await Utils.page.mouse.click(510, topRow)
        await Utils.wait(timeAfterClick)
        await Utils.page.mouse.click(610, topRow)
        await Utils.wait(timeAfterClick)
        await Utils.page.mouse.click(710, topRow)
        await Utils.wait(timeAfterClick)
        await Utils.page.mouse.click(800, topRow)
        await Utils.wait(timeAfterClick)
        await Utils.page.mouse.click(900, topRow)
        await Utils.wait(timeAfterClick)
        await Utils.page.mouse.click(1000, topRow)
        await Utils.wait(timeAfterClick)
        await Utils.page.mouse.click(610, bottomRow)
        await Utils.wait(timeAfterClick)
        await Utils.page.mouse.click(710, bottomRow)

        await Utils.page.mouse.move(0, 0, { steps: 3 })

        await Utils.checkRender(
            'baf45eea',
            new Clip(173, 34, 582, 582)
        )
    }
)