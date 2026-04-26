/*
    #402 Tooltips not round values
    https://github.com/kerssdead/charts/issues/402
    #424 Test for tooltips not round values
    https://github.com/kerssdead/charts/issues/424
 */

import { test } from '@playwright/test'
import Utils from './utils/Utils'
import Settings from './utils/Settings'
import { PlotAxisType, PlotType } from '../src/static/Enums'
import * as Constants from '../src/static/constants/Index'
import Clip from './utils/Clip'

test('When x-axis type is text tooltip value for y-axis should be formatted as number', async ({
                                                                                                   page,
                                                                                                   browserName
                                                                                               }) => {
    await Utils.setup(page, browserName)

    await Settings.enableInitAnimation(false)

    await Settings.xAxisType(PlotAxisType.Text)
    await Settings.plotType(PlotType.Column)
    await Settings.pointsCount(3)
    await Settings.seriesWidth(90)
    await Settings.enableTooltip()

    await Utils.scrollToCanvas()

    await page.waitForTimeout(50)

    await page.mouse.move(515, 308)

    await page.waitForTimeout(Constants.Animations.tooltip * 3)

    await Utils.checkScreenshot(
        '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',
        new Clip(344, 313, 151, 58)
    )
})