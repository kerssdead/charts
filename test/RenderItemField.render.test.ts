import RenderItem from '@/types/RenderItem'
import { diffuse } from '@/helpers/FieldBlur'
import { context, fieldData, fieldItem, OPAQUE_LUT, renderItem, WINDOW } from './RenderItemFieldTestData'
import { bitmaps, pixels } from './RenderItemFieldCanvasMock'

jest.mock('@/helpers/Canvas', () => jest.requireActual('./RenderItemFieldCanvasMock').canvasModule())

const render = (item: ReturnType<typeof fieldItem>, ctx = context(), target?: RenderItem) => {
    item.render(ctx as unknown as CanvasRenderingContext2D, target ?? renderItem(item))

    return ctx
}

const alphaOf = (value: number) => value >>> 24

describe('Rendering field', () => {
    beforeEach(() => {
        bitmaps.length = 0
    })

    it('Should draw the bitmap over the whole box', () => {
        const item = fieldItem()

        item.adjust(WINDOW)

        const ctx = render(item)

        expect(ctx.drawImage)
            .toHaveBeenCalledWith(bitmaps[0].canvas, 200, 400, 100, 50)
    })

    it('Should smooth the bitmap when scaling it up', () => {
        const item = fieldItem()

        item.adjust(WINDOW)

        expect(render(item).imageSmoothingEnabled)
            .toBe(true)
    })

    it('Should make the bitmap half the size of the box', () => {
        const item = fieldItem()

        item.adjust(WINDOW)
        render(item)

        expect([bitmaps[0].canvas.width, bitmaps[0].canvas.height])
            .toEqual([50, 25])
    })

    it('Should limit the size of the bitmap', () => {
        const item = fieldItem()

        item.box = { x: 0, y: 0, width: 5000, height: 5000 }
        item.adjust(new (WINDOW.constructor as new (w: number, h: number) => typeof WINDOW)(6000, 6000))
        render(item)

        expect([bitmaps[0].canvas.width, bitmaps[0].canvas.height])
            .toEqual([1024, 1024])
    })

    it('Should draw nothing without a field', () => {
        const item = fieldItem(null)

        item.adjust(WINDOW)

        expect(render(item).drawImage)
            .not.toHaveBeenCalled()
    })

    it('Should draw nothing for an empty box', () => {
        const item = fieldItem()

        item.box = { x: 0, y: 0, width: 0, height: 0 }
        item.adjust(WINDOW)

        expect(render(item).drawImage)
            .not.toHaveBeenCalled()
    })

    it('Should color every pixel by its value through the color table', () => {
        const item = fieldItem(fieldData([0, 100]))

        item.adjust(WINDOW)
        render(item)

        const row = pixels()

        expect(row[0])
            .toBe(0)
        expect(row[row.length / 25 - 1])
            .toBe(255)
    })

    it('Should interpolate between nodes', () => {
        const item = fieldItem(fieldData([0, 100]))

        item.adjust(WINDOW)
        render(item)

        const row = [...pixels()].slice(0, 50)

        expect(row.every((value, index) => index === 0 || value >= row[index - 1]))
            .toBe(true)
        expect(new Set(row).size)
            .toBeGreaterThan(10)
    })

    it('Should paint once while nothing changes', () => {
        const item = fieldItem()

        item.adjust(WINDOW)
        render(item)
        render(item)

        expect(bitmaps[0].put)
            .toHaveBeenCalledTimes(1)
    })

    it('Should paint again when the size changes', () => {
        const item = fieldItem()

        item.adjust(WINDOW)
        render(item)
        item.box = { x: 1000, y: 2000, width: 1000, height: 500 }
        item.adjust(WINDOW)
        render(item)

        expect(bitmaps[0].put)
            .toHaveBeenCalledTimes(2)
    })

    it('Should reveal the highest values first', () => {
        const item = fieldItem(fieldData([0, 100], { lut: OPAQUE_LUT }))
        const target = renderItem(item)

        item.adjust(WINDOW)
        target.animation.init = .5
        render(item, context(), target)

        const row = pixels()

        expect(alphaOf(row[row.length / 25 - 1]))
            .toBeGreaterThan(alphaOf(row[0]))
    })

    it('Should show everything once the reveal is done', () => {
        const item = fieldItem(fieldData([0, 100], { lut: OPAQUE_LUT }))
        const target = renderItem(item)

        item.adjust(WINDOW)
        target.animation.init = 0
        render(item, context(), target)
        target.animation.init = 1
        render(item, context(), target)

        expect(bitmaps[0].put)
            .toHaveBeenCalledTimes(2)
        expect(alphaOf(pixels()[0]))
            .toBe(255)
        expect(alphaOf(pixels()[pixels().length / 25 - 1]))
            .toBe(255)
    })

    it('Should spread points from sharp to soft during the intro', () => {
        const sources = new Float32Array(25)

        sources[12] = 10

        const diffusion = { sources, sigmaX: 2, sigmaY: 2 }
        const data = fieldData([], {
            columns: 5,
            rows: 5,
            values: diffuse(diffusion, 1, { columns: 5, rows: 5 }),
            max: 10,
            diffusion
        })
        const item = fieldItem(data)
        const target = renderItem(item)
        const soft = () => [...pixels()].filter(value => value > 0).length

        item.adjust(WINDOW)
        target.animation.init = .05
        render(item, context(), target)

        const sharp = soft()

        target.animation.init = 1
        render(item, context(), target)

        expect(soft())
            .toBeGreaterThan(sharp)
    })

    it('Should blend from the previous field during a morph', () => {
        const previous = fieldItem(fieldData([100, 100]))
        const item = fieldItem(fieldData([0, 0]))
        const target = renderItem(item)

        item.morphFrom(previous, 1)
        item.adjust(WINDOW, 0)
        render(item, context(), target)

        expect(pixels()[0])
            .toBe(255)

        item.adjust(WINDOW, 1)
        render(item, context(), target)

        expect(pixels()[0])
            .toBe(0)
    })

    it('Should keep drawing a living field every frame', () => {
        const data = fieldData([], {
            columns: 5,
            rows: 5,
            values: new Float32Array(25).fill(5),
            max: 10,
            alive: true,
            diffusion: { sources: new Float32Array(25).fill(5), sigmaX: 1, sigmaY: 1 }
        })
        const item = fieldItem(data)
        const target = renderItem(item)

        item.adjust(WINDOW)
        item.animateHover(null, 0)
        render(item, context(), target)
        item.animateHover(null, 3000)
        render(item, context(), target)

        expect(bitmaps[0].put)
            .toHaveBeenCalledTimes(2)
    })

    it('Should not repaint a living field twice in one frame', () => {
        const data = fieldData([], {
            columns: 2,
            rows: 2,
            values: new Float32Array(4).fill(5),
            alive: true,
            diffusion: { sources: new Float32Array(4).fill(5), sigmaX: 1, sigmaY: 1 }
        })
        const item = fieldItem(data)
        const target = renderItem(item)

        item.adjust(WINDOW)
        item.animateHover(null, 1000)
        render(item, context(), target)
        render(item, context(), target)

        expect(bitmaps[0].put)
            .toHaveBeenCalledTimes(1)
    })
})