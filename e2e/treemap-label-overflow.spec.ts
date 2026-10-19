/*
    #361 Label overlap cell
    https://github.com/kerssdead/charts/issues/361
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test('Tree Map label with spaces should not overflow cell', async ({ page, browserName }) => {
    await Utils.setup(page, browserName)

    await Settings.valuesCount(9)
    await Settings.customLabel('asdsadas   sa  das   d   hhhhh')
    await Settings.chartType(ChartType.TreeMap)
    await Settings.seed(181)

    await Utils.checkRender(
        '',
        new Clip(678, 181, 212, 30)
    )
})