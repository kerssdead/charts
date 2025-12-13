/*
    #382 Fixed rendering empty circular chart with negative radius value
    https://github.com/kerssdead/charts/issues/382
 */

import { test } from '@playwright/test'
import Utils from './utils/Utils'
import Settings from './utils/Settings'
import { ChartType } from '../src/static/Enums'

test(
    'Circular chart should not be rendered without any exceptions in console',
    async ({ page, browserName }) => {
        await Utils.setup(page, browserName)

        await Settings.enableInitAnimation(false)
        await Settings.width(1)
        await Settings.height(1)
        await Settings.valuesCount(2)
        await Settings.customLabel('custom label')
        await Settings.chartType(ChartType.Circular)
        await Settings.innerRadius(0)

        await Utils.checkForErrors()
    }
)