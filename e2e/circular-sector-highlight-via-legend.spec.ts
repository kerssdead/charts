/*
    #435 When mouse over item in legend it is not highlighting on chart
    https://github.com/kerssdead/charts/issues/435
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import { AnimationTiming } from '@/static/constants/Index'

test('Pie chart sector should be highlighted from legend', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.staticMode()

    await Settings.valuesCount(2)
    await Settings.chartType(ChartType.Pie)
    await Settings.enableLegend()

    await Utils.scrollToCanvas()
    await Utils.wait(50)

    await Utils.page.mouse.move(600, 700)
    await Utils.wait(AnimationTiming.hover * 2)

    await Utils.checkRender(
        ''
    )
})