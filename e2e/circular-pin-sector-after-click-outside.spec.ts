/*
    #442 After change browser tab or Alt+Tab top left sector pin
    https://github.com/kerssdead/charts/issues/442
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'

test(
    'Pie chart sector should not be pinned when mouse click not on sector and then mouse moved to sector',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.staticMode()

        await Settings.valuesCount(2)
        await Settings.chartType(ChartType.Pie)

        await Utils.scrollToCanvas()
        await Utils.wait(50)

        await Utils.page.mouse.click(200, 200)
        await Utils.wait(50)
        await Utils.page.mouse.move(1000, 600, { steps: 5 })
        await Utils.wait(700)

        await Utils.checkRender('')
    }
)