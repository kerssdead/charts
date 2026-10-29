import { edgeFadeMask } from '@/helpers/Canvas'

const context = () => {
    const addColorStop = jest.fn()
    const createLinearGradient = jest.fn(() => ({ addColorStop }))

    return { ctx: { createLinearGradient } as unknown as CanvasRenderingContext2D, createLinearGradient, addColorStop }
}

const getStopOffsets = (x1: number, x2: number, fade: number) => {
    const { ctx, addColorStop } = context()

    edgeFadeMask(ctx, x1, x2, fade)

    return addColorStop.mock.calls.map(([offset]) => offset)
}

describe('Getting edge fade mask', () => {
    it('Should span mask horizontally between edges', () => {
        const { ctx, createLinearGradient } = context()

        edgeFadeMask(ctx, 10, 110, 10)

        expect(createLinearGradient)
            .toHaveBeenCalledWith(10, 0, 110, 0)
    })

    it('Should fade both edges to transparent over fade width', () => {
        const { ctx, addColorStop } = context()

        edgeFadeMask(ctx, 0, 100, 10)

        expect(addColorStop.mock.calls)
            .toEqual([[0, '#00000000'], [.1, '#000000ff'], [.9, '#000000ff'], [1, '#00000000']])
    })

    it('Should cap fade at half width for narrow area', () => {
        expect(getStopOffsets(0, 10, 12))
            .toEqual([0, .5, .5, 1])
    })

    it('Should keep finite offsets for zero width', () => {
        expect(getStopOffsets(5, 5, 12))
            .toEqual([0, .5, .5, 1])
    })
})