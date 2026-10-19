import { test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { PlotType } from '@/static/Enums'
import Clip from '@e2e/utils/Clip'

test(
    'Plot chart with solid lines should be rendered without any issues',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.valuesCount(1)
        await Settings.pointsCount(3)
        await Settings.seriesWidth(10)
        await Settings.plotType(PlotType.Line)

        await Utils.checkRender(
            '5acc6211',
            new Clip(212, 165, 565, 260)
        )
    }
)