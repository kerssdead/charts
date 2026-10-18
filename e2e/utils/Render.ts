import { createHash } from 'crypto'
import { expect, Page } from '@playwright/test'
import Clip from '@e2e/utils/Clip'

const ARIAL_CHAR_WIDTHS = [
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
    1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
    333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
    556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584
]

export default class Render {
    static intercept(page: Page) {
        return page.addInitScript(interceptDrawCalls, ARIAL_CHAR_WIDTHS)
    }

    static async drawCalls(page: Page, clip?: Clip) {
        const canvas = page.locator('.chart-container canvas').first()

        await canvas.scrollIntoViewIfNeeded()

        let drawCalls: string | null = null

        await expect.poll(async () => {
            const previous = drawCalls

            drawCalls = await canvas.evaluate(drawCallsInClip, clip)

            return drawCalls == previous
        }, { intervals: [100] }).toBe(true)

        return drawCalls!
    }

    static hash(drawCalls: string) {
        return createHash('sha1').update(drawCalls).digest('hex').slice(0, 8)
    }

    static async image(page: Page, clip?: Clip) {
        const chart = (await page.locator('.chart-container').boundingBox())!

        return page.screenshot({
            fullPage: true,
            clip: {
                x: chart.x + (clip?.x ?? 0),
                y: chart.y + 12 + (clip?.y ?? 0),
                width: clip?.width || chart.width - (clip?.x ?? 0),
                height: clip?.height || chart.height - (clip?.y ?? 0)
            }
        })
    }
}

type Point = [number, number]

type PointsOf = (ctx: any, args: any[]) => Point[]

function interceptDrawCalls(arialCharWidths: number[]) {
    const context = CanvasRenderingContext2D.prototype as any

    const descriptors = Object.getOwnPropertyDescriptors(context)
    const stateKeys = Object.keys(descriptors).filter(key => descriptors[key].set)

    const gradients = new WeakMap<CanvasGradient, any[]>()

    let path: any[] = []
    let pathPoints: Point[] = []

    const rectanglePoints: PointsOf = (_, [x, y, width, height]) => [[x, y], [x + width, y + height]]

    const textPoints: PointsOf = (ctx, [text, x, y]) => {
        const size = Math.max(ctx.measureText(text).width, parseFloat(ctx.font))

        return [[x - size, y - size], [x + size, y + size]]
    }

    const PATH_COMMANDS: [string, PointsOf][] = [
        ['closePath', () => []],
        ['moveTo', (_, [x, y]) => [[x, y]]],
        ['lineTo', (_, [x, y]) => [[x, y]]],
        ['arcTo', (_, [x1, y1, x2, y2]) => [[x1, y1], [x2, y2]]],
        ['quadraticCurveTo', (_, [cpx, cpy, x, y]) => [[cpx, cpy], [x, y]]],
        ['bezierCurveTo', (_, [cp1x, cp1y, cp2x, cp2y, x, y]) => [[cp1x, cp1y], [cp2x, cp2y], [x, y]]],
        ['arc', (_, [x, y, radius]) => [[x - radius, y - radius], [x + radius, y + radius]]],
        ['ellipse', (_, [x, y, radiusX, radiusY]) => [[x - radiusX, y - radiusY], [x + radiusX, y + radiusY]]],
        ['rect', rectanglePoints],
        ['roundRect', rectanglePoints]
    ]

    const SHAPE_DRAWS: [string, PointsOf][] = [
        ['fillRect', rectanglePoints],
        ['strokeRect', rectanglePoints],
        ['clearRect', rectanglePoints],
        ['fillText', textPoints],
        ['strokeText', textPoints]
    ]

    const PATH_DRAWS = ['fill', 'stroke', 'clip']

    const patch = (proto: any, name: string, callback: (target: any, args: any[], result: any) => void) => {
        const original = proto[name]

        proto[name] = function (...args: any[]) {
            const result = original.apply(this, args)

            callback(this, args, result)

            return result
        }
    }

    const normalize = (value: any): any => {
        if (typeof value == 'number')
            return Math.round(value * 100) / 100

        if (Array.isArray(value))
            return value.map(normalize)

        if (value instanceof CanvasGradient)
            return gradients.get(value)

        return value
    }

    const toCanvas = (ctx: any, points: Point[]): Point[] => {
        const matrix = ctx.getTransform()
        const pixelRatio = ctx.canvas.width / ctx.canvas.clientWidth

        return points.map(([x, y]) => [
            (matrix.a * x + matrix.c * y + matrix.e) / pixelRatio,
            (matrix.b * x + matrix.d * y + matrix.f) / pixelRatio
        ])
    }

    const boundsOf = (points: Point[]) => ({
        left: Math.min(...points.map(([x]) => x)),
        top: Math.min(...points.map(([, y]) => y)),
        right: Math.max(...points.map(([x]) => x)),
        bottom: Math.max(...points.map(([, y]) => y))
    })

    const stateOf = (ctx: any) => ({
        ...Object.fromEntries(stateKeys.map(key => [key, normalize(ctx[key])])),
        lineDash: normalize(ctx.getLineDash()),
        transform: normalize([...ctx.getTransform().toFloat64Array()])
    })

    const record = (ctx: any, name: string, args: any[], path: any[], points: Point[]) => {
        ctx.canvas.drawCalls ??= []
        ctx.canvas.drawCalls.push({
            name,
            args: normalize(args),
            path,
            state: stateOf(ctx),
            bounds: boundsOf(points)
        })
    }

    context.measureText = function (text: string) {
        const width = [...text].reduce((sum, char) => sum + (arialCharWidths[char.charCodeAt(0) - 32] ?? 556), 0)

        return { width: width / 1000 * parseFloat(this.font) }
    }

    patch(context, 'createLinearGradient', (_, args, gradient) => gradients.set(gradient, normalize(args)))

    patch(CanvasGradient.prototype, 'addColorStop', (gradient, args) => gradients.get(gradient)?.push(normalize(args)))

    patch(context, 'setTransform', ctx => ctx.canvas.drawCalls = [])

    patch(context, 'beginPath', () => {
        path = []
        pathPoints = []
    })

    for (const [name, pointsOf] of PATH_COMMANDS)
        patch(context, name, (ctx, args) => {
            path.push([name, ...normalize(args)])
            pathPoints.push(...toCanvas(ctx, pointsOf(ctx, args)))
        })

    for (const name of PATH_DRAWS)
        patch(context, name, (ctx, args) => record(ctx, name, args, path.slice(), pathPoints))

    for (const [name, pointsOf] of SHAPE_DRAWS)
        patch(context, name, (ctx, args) => record(ctx, name, args, [], toCanvas(ctx, pointsOf(ctx, args))))
}

function drawCallsInClip(canvas: any, clip?: Clip) {
    const containerRect = canvas.closest('.chart-container').getBoundingClientRect()
    const canvasRect = canvas.getBoundingClientRect()

    const left = (clip?.x ?? 0) + containerRect.x - canvasRect.x
    const top = (clip?.y ?? 0) + 12 + containerRect.y - canvasRect.y
    const right = clip?.width ? left + clip.width : Infinity
    const bottom = clip?.height ? top + clip.height : Infinity

    const isInClip = ({ bounds }: any) => bounds.left <= right && bounds.right >= left
                                          && bounds.top <= bottom && bounds.bottom >= top

    return (canvas.drawCalls ?? [])
        .filter((call: any) => !clip || isInClip(call))
        .map(({ bounds, ...call }: any) => JSON.stringify(call))
        .join('\n')
}