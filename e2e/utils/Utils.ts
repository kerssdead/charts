import { expect, Page, test } from '@playwright/test'
import { pathToFileURL } from 'url'
import path from 'path'
import Selectors from '@e2e/utils/Selectors'
import Render from '@e2e/utils/Render'
import Clip from '@e2e/utils/Clip'
import Settings from '@e2e/utils/Settings'

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
        await Utils.page.goto(pathToFileURL(path.resolve(__dirname, '../../index.html')).href)
    }

    static scrollToCanvas() {
        return Utils.page.locator(Selectors.chart).scrollIntoViewIfNeeded()
    }

    static async checkRender(expected: string, clip?: Clip | undefined) {
        const drawCalls = await Render.drawCalls(Utils.page, clip)
        const hash = Render.hash(drawCalls)

        if (hash != expected) {
            console.log(`Draw calls (${ hash }):\n${ drawCalls }`)

            await test.info().attach('clip', { body: await Render.image(Utils.page, clip), contentType: 'image/png' })
        }

        expect(hash).toBe(expected)
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
            'pageerror',
            error => this.errors.push(error)
        )

        await Render.intercept(page)

        await Utils.goto()

        await Settings.width(100)
        await Settings.height(100)
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