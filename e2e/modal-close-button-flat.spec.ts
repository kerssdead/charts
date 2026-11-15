import { expect, test } from '@playwright/test'
import Utils from '@e2e/utils/Utils'
import Settings from '@e2e/utils/Settings'
import { ChartType } from '@/static/Enums'

test(
    'Modal close button should not inherit page button decorations',
    async ({ page }) => {
        await Utils.setup(page, 'chromium')

        await Settings.staticMode()
        await Settings.chartType(ChartType.Plot)

        // Commit pending settings changes before opening the canvas menu.
        await page.mouse.click(0, 0)

        await Utils.scrollToCanvas()
        await Utils.wait(50)

        await page.mouse.click(1084, 20)
        await page.locator('[role="menuitem"]', { hasText: 'Show as table' }).click()
        await page.waitForSelector('dialog', { timeout: 6000 })

        const style = await page.locator('.o-modal-close').evaluate(element => {
            const computed = getComputedStyle(element)

            return {
                borderStyle: computed.borderStyle,
                boxShadow: computed.boxShadow,
                backdropFilter: computed.backdropFilter,
                background: computed.backgroundColor,
                padding: computed.padding
            }
        })

        expect(style)
            .toEqual({
                borderStyle: 'none',
                boxShadow: 'none',
                backdropFilter: 'none',
                background: 'rgba(0, 0, 0, 0)',
                padding: '0px'
            })
    }
)
