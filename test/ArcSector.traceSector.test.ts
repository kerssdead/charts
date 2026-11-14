import { traceSector, ArcShape, SectorOutline } from '@/helpers/ArcSector'

const shape = (start: number, end: number): ArcShape => {
    return { x: 0, y: 0, start, end, middle: (start + end) / 2 }
}

const outline: SectorOutline = { radius: 10, innerRadius: 2, gap: 0, cornerRadius: 0 }

const context = () => ({
    arc: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn()
})

describe('Tracing sector outline', () => {
    it('Should not trace a sector with no sweep', () => {
        const ctx = context()

        expect(traceSector(ctx as unknown as CanvasRenderingContext2D, shape(1, 1), outline))
            .toBe(false)
        expect(ctx.arc)
            .not.toHaveBeenCalled()
        expect(ctx.closePath)
            .not.toHaveBeenCalled()
    })

    it('Should trace a valid sector and close the path', () => {
        const ctx = context()

        expect(traceSector(ctx as unknown as CanvasRenderingContext2D, shape(0, Math.PI / 2), outline))
            .toBe(true)
        expect(ctx.closePath)
            .toHaveBeenCalled()
    })

    it('Should trace the apex when the inner radius is too small for the gap', () => {
        const ctx = context()

        expect(traceSector(ctx as unknown as CanvasRenderingContext2D, shape(0, Math.PI / 2), { ...outline, gap: 6 }))
            .toBe(true)
        expect(ctx.lineTo)
            .toHaveBeenCalled()
    })
})
