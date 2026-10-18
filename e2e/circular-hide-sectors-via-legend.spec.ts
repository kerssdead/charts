/*
    #433 Disabled data still displaying on chart
    https://github.com/kerssdead/charts/issues/433
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import { AnimationTiming } from '@/static/constants/Index'
import Clip from '@e2e/utils/Clip'

test('Pie chart sectors should not be rendered after disabled in legend', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.enableInitAnimation(false)

    await Settings.chartType(ChartType.Pie)
    await Settings.enableLegend()
    await Settings.valuesCount(10)

    await Utils.scrollToCanvas()
    await Utils.wait(1000)

    const timeAfterClick = AnimationTiming.legend

    await Utils.wait(timeAfterClick)
    await Utils.page.mouse.click(340, 670)
    await Utils.wait(timeAfterClick)
    await Utils.page.mouse.click(440, 670)
    await Utils.wait(timeAfterClick)
    await Utils.page.mouse.click(540, 670)
    await Utils.wait(timeAfterClick)
    await Utils.page.mouse.click(640, 670)
    await Utils.wait(timeAfterClick)
    await Utils.page.mouse.click(740, 670)
    await Utils.wait(timeAfterClick)
    await Utils.page.mouse.click(840, 670)
    await Utils.wait(timeAfterClick)
    await Utils.page.mouse.click(920, 670)
    await Utils.wait(timeAfterClick)
    await Utils.page.mouse.click(340, 700)
    await Utils.wait(timeAfterClick)
    await Utils.page.mouse.click(440, 700)
    await Utils.wait(timeAfterClick)
    await Utils.page.mouse.click(540, 700)
    await Utils.wait(AnimationTiming.legend * 11)

    await Utils.page.mouse.move(0, 0, { steps: 3 })
    await Utils.wait(AnimationTiming.legend)

    await Utils.checkRender(
        '',
        new Clip(173, 34, 582, 582)
    )
})