import { expect, Page } from '@playwright/test'
import { Clip } from './Clip'

export class Screenshot {
    static async get(page: Page, clip?: Clip) {
        const chart = page.locator('#chart')

        await chart.scrollIntoViewIfNeeded()

        const elementPosition = await chart.boundingBox()

        expect(elementPosition).not.toBeNull()

        elementPosition!.y += 12

        if (clip) {
            elementPosition!.x += clip.x ?? 0
            elementPosition!.y += clip.y ?? 0
            elementPosition!.width = clip.width
                                     ? clip.width
                                     : elementPosition!.width - (clip.x ?? 0)
            elementPosition!.height = clip.height
                                      ? clip.height
                                      : elementPosition!.height - (clip.y ?? 0)
        }

        const screenshot = await page.screenshot({
            fullPage: true,
            type: 'png',
            clip: {
                x: elementPosition!.x,
                y: elementPosition!.y,
                width: elementPosition!.width,
                height: elementPosition!.height
            }
        })

        return screenshot.toString('base64')
    }
}