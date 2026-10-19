import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Tree Map width should be resized', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.width(50)

    await Settings.staticMode()
    await Settings.valuesCount(5)
    await Settings.chartType(ChartType.TreeMap)

    await Utils.checkRender(
        '',
        new Clip(238, 0, 452, 720)
    )
})