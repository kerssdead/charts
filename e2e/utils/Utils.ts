import { Page } from '@playwright/test'

export class Utils {
    static async local(page: Page) {
        await page.goto('file:///Users/sergey/WebstormProjects/charts/index.html')
    }
}