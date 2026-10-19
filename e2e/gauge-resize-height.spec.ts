import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Gauge height should be resized', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.height(70)

    await Settings.staticMode()
    await Settings.valuesCount(5)
    await Settings.chartType(ChartType.Gauge)

    await Utils.checkRender(
        '',
        new Clip(0, 110, 928, 500)
    )
})