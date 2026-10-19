/*
    #402 Tooltips not round values
    https://github.com/kerssdead/charts/issues/402
    #424 Test for tooltips not round values
    https://github.com/kerssdead/charts/issues/424
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { PlotAxisType, PlotType } from '@/static/Enums'
import * as Constants from '@/static/constants/Index'
import Clip from '@e2e/utils/Clip'

test('When x-axis type is text tooltip value for y-axis should be formatted as number', async ({
                                                                                                   page,
                                                                                                   browserName
                                                                                               }) => {
    await Utils.setup(page, browserName)

    await Settings.staticMode()

    await Settings.xAxisType(PlotAxisType.Text)
    await Settings.plotType(PlotType.Column)
    await Settings.pointsCount(3)
    await Settings.seriesWidth(90)
    await Settings.enableTooltip()

    await Utils.scrollToCanvas()

    await page.waitForTimeout(50)

    await page.mouse.move(515, 308)

    await page.waitForTimeout(Constants.Tooltip.fadeDuration * 3)

    await Utils.checkRender(
        '',
        new Clip(344, 313, 151, 58)
    )
})