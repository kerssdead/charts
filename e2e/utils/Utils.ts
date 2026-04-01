import { expect, Page } from '@playwright/test'
import Selectors from './Selectors'
import { Screenshot } from './Screenshot'
import Clip from './Clip'
import Settings from './Settings'

type BrowserName = 'chromium' | 'firefox' | 'webkit'

class Utils {
    static page: Page

    static browserName: BrowserName | undefined

    static errors: Array<Error>

    static initialize(page: Page, browserName?: BrowserName) {
        this.page = page
        this.browserName = browserName
        this.errors = []
    }

    static async goto() {
        if (process.env.CI)
            await Utils.page.goto('/charts/')
        else
            await Utils.page.goto('file:///Users/sergey/WebstormProjects/charts/index.html')
    }

    static scrollToCanvas() {
        return Utils.page.locator(Selectors.chart).scrollIntoViewIfNeeded()
    }

    static async checkScreenshot(clip: Clip | undefined,
                                 chromium: string,
                                 firefox: string,
                                 webkit: string) {
        const o = {
            chromium: chromium,
            firefox: firefox,
            webkit: webkit
        }

        const browserName = Utils.browserName ?? 'chromium'

        if (o[browserName] === 'TODO')
            return

        expect(await Screenshot.get(Utils.page, clip))
            .toBe(o[browserName])
    }

    static async checkForErrors() {
        await Utils.wait(1000)

        if (this.errors.length > 0) {
            console.log(await this.page.consoleMessages())
            console.log(this.errors)
        }

        expect(this.errors).toHaveLength(0)
    }

    static async setup(page: Page, browserName?: BrowserName) {
        Utils.initialize(page, browserName)
        Settings.initialize(page)

        page.addListener(
            "pageerror",
            error => this.errors.push(error)
        )

        await Utils.goto()
    }

    static async wait(timeout: number) {
        await Utils.page.waitForTimeout(timeout)
    }

    static async elapsed(start: number, elapsed: number) {
        expect(performance.now() - start)
            .toBeLessThanOrEqual(elapsed * (process.env.CI ? 2 : 1))
    }
}

export default Utils