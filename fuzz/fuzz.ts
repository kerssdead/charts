import { BrowserContext, BrowserType, chromium, firefox, Page, webkit } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'
import { createGenerator } from './generator'
import { ErrorType } from '../src/static/Enums'

declare global {
    interface Window {
        __issues: { kind: string, msg: string }[]

        __text: unknown[]

        __chart: any

        __collectTextIssues: () => void
    }
}

declare const OCharts: any

const DURATION = +(process.env.DURATION || 600) * 1000
const OUT = process.env.OUT || path.join(__dirname, 'results.jsonl')
const STRICT = !!process.env.STRICT
const BROWSERS: Record<string, BrowserType> = { chromium, firefox, webkit }
const BROWSER = process.env.BROWSER || 'chromium'

const HEURISTIC_KINDS = ['textoverlap', 'textoutside']
const NOISE = ['setPointerCapture', 'user gesture', 'User activation', 'ResizeObserver loop', ErrorType.InvalidGaugeRange]

const seed = +(process.env.SEED || Date.now() % 1e9)
const G = createGenerator(seed)
const { gen, rnd, ri, pick, chance } = G

const isFailure = (issue: { kind: string, msg: string }) => {
    if (NOISE.some(noise => issue.msg.includes(noise)))
        return false

    return STRICT || !HEURISTIC_KINDS.includes(issue.kind)
}

async function main() {
    const browser = await BROWSERS[BROWSER].launch()
    const end = Date.now() + DURATION

    let iter = 0
    let failures = 0
    let page!: Page
    let ctx: BrowserContext | undefined
    let consoleLog: string[] = []

    fs.writeFileSync(OUT, '')

    const newPage = async () => {
        if (ctx)
            await ctx.close().catch(() => {})

        ctx = await browser.newContext({
            viewport: { width: 1600, height: 1100 },
            deviceScaleFactor: pick([1, 2, 1.5])
        })

        page = await ctx.newPage()

        consoleLog = []

        page.on('console', message => {
            if (message.type() === 'error' || message.type() === 'warning')
                consoleLog.push(message.type() + ': ' + message.text())
        })

        page.on('pageerror', error => consoleLog.push('pageerror: ' + (error.stack || error.message)))

        await page.goto('file://' + path.join(__dirname, 'page.html'))
    }

    await newPage()

    while (Date.now() < end) {
        iter++

        const caseSeed = G.seed
        const g = gen()
        const g2 = chance(0.3) ? gen() : null
        const steps: string[] = []
        const t0 = Date.now()

        let fatal: string | null = null

        try {
            consoleLog = []

            await page.evaluate(() => {
                window.__issues = []
                window.__text = []
            })

            await page.evaluate(({ settings, size }) => {
                const el = document.getElementById('chart')!

                el.style.width = size[0] + 'px'
                el.style.height = size[1] + 'px'

                const dark = settings.dark

                settings.isDarkThemeFunction = () => dark

                if (settings.contextMenu)
                    settings.contextMenu.forEach((button: any) => button.action = () => {})

                window.__chart = OCharts.chart(el, settings)
            }, g)
                      .catch(e => {
                          throw new Error('create: ' + e.message)
                      })

            await page.waitForTimeout(ri(50, 1200))
            await page.evaluate(() => window.__collectTextIssues())

            const box = await page.locator('#chart canvas')
                                  .first()
                                  .boundingBox({ timeout: 1000 })
                                  .catch(() => null)
            const nActions = ri(3, 25)

            for (let k = 0; k < nActions && box; k++) {
                const x = box.x + rnd() * box.width
                const y = box.y + rnd() * box.height
                const a = pick([
                    'move', 'move', 'move', 'click', 'rclick', 'wheel', 'drag', 'dblclick', 'leave', 'resize', 'key',
                    'legendsweep', 'menu'
                ])

                steps.push(a)

                switch (a) {
                    case 'move':
                        await page.mouse.move(x, y, { steps: ri(1, 5) })

                        break

                    case 'click':
                        await page.mouse.click(x, y)

                        break

                    case 'dblclick':
                        await page.mouse.dblclick(x, y)

                        break

                    case 'rclick':
                        await page.mouse.click(x, y, { button: 'right' })

                        break

                    case 'wheel':
                        await page.mouse.move(x, y)
                        await page.keyboard.down('Control')
                        await page.mouse.wheel(0, pick([-500, -100, 100, 500]))
                        await page.keyboard.up('Control')

                        break

                    case 'drag':
                        await page.mouse.move(x, y)
                        await page.mouse.down()
                        await page.mouse.move(x + ri(-300, 300), y + ri(-200, 200), { steps: 5 })
                        await page.mouse.up()

                        break

                    case 'leave':
                        await page.mouse.move(1590, 1090)

                        break

                    case 'key':
                        await page.keyboard.press(pick([
                            'Escape', 'Tab', 'Shift+Tab', 'Enter', 'Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp',
                            'ArrowDown', 'Home', 'End', 'Shift+F10', 'ContextMenu'
                        ]))

                        break

                    case 'resize': {
                        const s = [ri(1, 1500), ri(1, 1000)]

                        steps.push('resize' + s)

                        await page.evaluate(s => {
                            const el = document.getElementById('chart')!

                            el.style.width = s[0] + 'px'
                            el.style.height = s[1] + 'px'
                        }, s)

                        break
                    }

                    case 'legendsweep':
                        for (let yy = box.y + box.height - 5; yy > box.y + box.height - 60; yy -= 12)
                            for (let xx = box.x + 5; xx < box.x + box.width; xx += 40)
                                await page.mouse.move(xx, yy)

                        await page.mouse.click(box.x + box.width / 2, box.y + box.height - 15)

                        break

                    case 'menu':
                        await page.mouse.click(box.x + box.width - 15, box.y + 15)
                        await page.waitForTimeout(100)
                        await page.mouse.click(box.x + box.width - 40, box.y + 60)

                        break
                }

                await page.waitForTimeout(ri(0, 150))
            }

            if (g2) {
                steps.push('applySettings')

                await page.evaluate(({ settings }) => {
                    const dark = settings.dark

                    settings.isDarkThemeFunction = () => dark

                    window.__chart.applySettings(settings)
                }, g2)

                await page.waitForTimeout(ri(50, 600))

                if (box)
                    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 })
            }

            if (chance(0.2)) {
                steps.push('render+destroy')

                await page.evaluate(() => {
                    window.__chart.render()
                    window.__chart.destroy()
                    window.__chart.render()
                    window.__chart.applySettings({})
                })
            } else {
                await page.evaluate(() => window.__chart.destroy())
            }

            await page.evaluate(() => {
                document.querySelectorAll('dialog, body > div:not(#chart)')
                        .forEach(e => e.remove())
            })

            await page.waitForTimeout(30)

            const leftovers = await page.evaluate(() => document.getElementById('chart')!.children.length)

            if (leftovers)
                await page.evaluate(n => {
                    window.__issues.push({ kind: 'leak', msg: `${ n } children left in container after destroy` })
                }, leftovers)
        } catch (e) {
            fatal = String((e as Error).message || e)
                .split('\n')
                .slice(0, 6)
                .join('\n')
        }

        let issues: { kind: string, msg: string }[] = []

        try {
            issues = await page.evaluate(() => window.__issues)
        } catch {
            issues = []
        }

        const consoleMessages = consoleLog.slice(0, 10)
        const dt = Date.now() - t0

        if (fatal || issues.length || consoleMessages.length || dt > 20000) {
            fs.appendFileSync(OUT, JSON.stringify({
                iter,
                caseSeed,
                fatal,
                issues: issues.slice(0, 30),
                console: consoleMessages,
                steps,
                dt,
                g,
                g2
            }) + '\n')

            if (fatal || dt > 20000 || issues.some(isFailure) || consoleMessages.some(m => !NOISE.some(n => m.includes(n))))
                failures++
        }

        if (fatal || iter % 40 === 0)
            await newPage()
        else
            await page.evaluate(() => {
                document.getElementById('chart')!.innerHTML = ''
            })
                      .catch(async () => await newPage())

        if (iter % 20 === 0)
            console.log(`iter ${ iter } ${ Math.round((end - Date.now()) / 1000) }s left`)
    }

    await browser.close()

    console.log(`done: ${ iter } iterations, ${ failures } failing, startSeed ${ seed }, browser ${ BROWSER }, log ${ OUT }`)

    if (failures)
        process.exitCode = 1
}

main()
    .catch(e => {
        console.error(e)

        process.exitCode = 1
    })