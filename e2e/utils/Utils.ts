import { Page } from '@playwright/test'

export class Utils {
    static async goto(page: Page) {
        if (process.env.CI)
            await page.goto('/charts/')
        else
            await page.goto('file:///Users/sergey/WebstormProjects/charts/index.html')
    }
}