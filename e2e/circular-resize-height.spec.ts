import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Circular height should be resized', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.height(30)

    await Settings.staticMode()
    await Settings.valuesCount(5)
    await Settings.chartType(ChartType.Pie)

    await Utils.checkRender(
        '',
        new Clip(299, 270, 330, 180)
    )
})