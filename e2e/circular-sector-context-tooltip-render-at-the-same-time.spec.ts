/*
    #434 Tooltip and Context menu render in the same time
    https://github.com/kerssdead/charts/issues/434
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'

test(
    'Pie chart sector tooltip and context menu should not render at the same time',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.staticMode()

        await Settings.chartType(ChartType.Pie)
        await Settings.enableTooltip()
        await Settings.enableContextMenu()
        await Settings.valuesCount(2)
        await Utils.page.mouse.click(0, 0)

        await Utils.scrollToCanvas()
        await Utils.wait(50)

        await Utils.page.mouse.move(600, 500)
        await Utils.wait(200)
        await Utils.page.mouse.click(600, 520, { button: 'right' })
        await Utils.wait(500)
        await Utils.page.mouse.move(600, 500)
        await Utils.wait(500)
        await Utils.page.mouse.move(550, 500, { steps: 3 })
        await Utils.wait(500)

        await Utils.checkRender('6a54ecac')
    }
)