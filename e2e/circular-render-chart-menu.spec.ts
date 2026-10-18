/*
    #454 Chart menu can't be opened
    https://github.com/kerssdead/charts/issues/454
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Chart menu for circular chart type should be rendered correct', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.enableInitAnimation(false)

    await Settings.valuesCount(2)
    await Settings.chartType(ChartType.Pie)

    await Utils.scrollToCanvas()
    await Utils.wait(50)

    await Utils.page.mouse.click(1080, 15)

    await Utils.checkRender(
        '',
        new Clip(787, 29, 138, 84)
    )
})