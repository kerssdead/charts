import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings, { LineType } from '@e2e/utils/Settings'
import { PlotType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Plot chart with dotted lines should be rendered without any issues', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.valuesCount(1)
    await Settings.pointsCount(3)
    await Settings.seriesWidth(10)
    await Settings.plotType(PlotType.Line)
    await Settings.lineType(LineType.Dotted)

    await Utils.checkRender(
        '',
        new Clip(212, 165, 565, 260)
    )
})