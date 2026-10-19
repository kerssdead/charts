/*
    #343 If plot has series with same name in decomposition to table one of them will be missed
    https://github.com/kerssdead/charts/issues/343
 */

import { expect, test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'

test(
    'Values with same names should decomposed to separate rows',
    async ({ page }) => {
        await Utils.setup(page)

        const count = Math.ceil(Math.random() * 10)

        await Settings.staticMode()

        await Settings.valuesCount(count)
        await Settings.customLabel('Same')
        await Settings.chartType(ChartType.Plot)

        await Utils.scrollToCanvas()
        await Utils.wait(50)

        await Utils.page.mouse.click(1084, 20)
        await page.mouse.click(1084, 90)

        await page.waitForSelector('dialog', { timeout: 6000 })

        expect(await page.locator('dialog .o-table .o-table-row').count())
            .toBe(count)
    }
)