/*
    #438 Dark theme not working
    https://github.com/kerssdead/charts/issues/438
 */

import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { PlotType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test(
    'Dark theme should work in plot chart',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.valuesCount(1)
        await Settings.pointsCount(20)
        await Settings.seriesWidth(10)
        await Settings.plotType(PlotType.Line)
        await Settings.enableDarkTheme()

        await Utils.checkRender(
            'd6fa8a17',
            new Clip(40, 80, 100, 20)
        )
    }
)