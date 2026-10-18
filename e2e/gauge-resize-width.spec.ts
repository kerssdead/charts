import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Gauge width should be resized', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.width(60)

    await Settings.enableInitAnimation(false)
    await Settings.valuesCount(5)
    await Settings.chartType(ChartType.Gauge)

    await Utils.checkRender(
        '',
        new Clip(164, 0, 600, 720)
    )
})