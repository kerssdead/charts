import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { PlotType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Plot chart with bars y-axis should be rendered without any issues', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.valuesCount(3)
    await Settings.pointsCount(3)
    await Settings.seriesWidth(90)
    await Settings.plotType(PlotType.Bar)

    await Utils.checkRender(
        '',
        new Clip(38, 126, 37, 446)
    )
})