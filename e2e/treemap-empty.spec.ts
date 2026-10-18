/*
    #345 If there is no data show empty placeholder
    https://github.com/kerssdead/charts/issues/345
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'

test('Tree Map without data should render empty placeholder', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.valuesCount(0)
    await Settings.chartType(ChartType.TreeMap)

    await Utils.checkRender(
        ''
    )
})