/*
    #369 Pinned sector overflow previous label
    https://github.com/kerssdead/charts/issues/369
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

// todo: add pin sector on pie chart

test(
    'Hover sector in circular chart should not overlap other labels',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.staticMode()

        await Settings.valuesCount(50)
        await Settings.chartType(ChartType.Pie)

        await Utils.scrollToCanvas()
        await Utils.wait(50)

        await Utils.page.mouse.move(590, 600)
        await Utils.wait(400)

        await Utils.checkRender(
            '',
            new Clip(330, 620, 100, 100)
        )
    }
)