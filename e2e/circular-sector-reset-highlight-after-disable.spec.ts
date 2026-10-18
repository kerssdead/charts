/*
    #447 After disable sector other sector will never return to idle state
    https://github.com/kerssdead/charts/issues/447
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import { AnimationTiming } from '@/static/constants/Index'

test('Pie chart sectors should not has another item over states', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.enableInitAnimation(false)

    await Settings.valuesCount(3)
    await Settings.chartType(ChartType.Pie)
    await Settings.enableLegend()

    await Utils.scrollToCanvas()
    await Utils.wait(50)

    await Utils.page.mouse.move(600, 700)
    await Utils.page.mouse.click(600, 700)
    await Utils.wait(AnimationTiming.hover * 2)

    await Utils.checkRender(
        ''
    )
})