import LineMarkers from '@/helpers/LineMarkers'

const context = () => ({
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn()
})

const markersWithHover = (index: number) => {
    const markers = new LineMarkers()

    markers.animate(index, 0, true)

    return markers
}

describe('Rendering line markers', () => {
    it('Should draw a marker at the hovered stop', () => {
        const markers = markersWithHover(1)
        const ctx = context()

        markers.render(ctx as unknown as CanvasRenderingContext2D, [{ x: 10, y: 20 }, { x: 30, y: 40 }], 4)

        expect(ctx.arc)
            .toHaveBeenCalledWith(30, 40, 6, 0, Math.PI * 2)
        expect(ctx.fill)
            .toHaveBeenCalledTimes(1)
    })

    it('Should skip markers of stops that are no longer present', () => {
        const markers = markersWithHover(5)
        const ctx = context()

        markers.render(ctx as unknown as CanvasRenderingContext2D, [{ x: 10, y: 20 }], 4)

        expect(ctx.beginPath)
            .not.toHaveBeenCalled()
    })

    it('Should skip markers that faded away', () => {
        const markers = new LineMarkers()

        markers.animate(1, 0, true)
        markers.animate(-1, 0, true)

        const ctx = context()

        markers.render(ctx as unknown as CanvasRenderingContext2D, [{ x: 10, y: 20 }, { x: 30, y: 40 }], 4)

        expect(ctx.beginPath)
            .not.toHaveBeenCalled()
    })
})
