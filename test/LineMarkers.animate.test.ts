import LineMarkers from '@/helpers/LineMarkers'

describe('Animating line markers', () => {
    it('Should grow the hovered marker', () => {
        const markers = new LineMarkers()

        markers.animate(2, 0)

        expect(markers.animate(2, 100))
            .toBe(true)
    })

    it('Should stop animating once the hovered marker is settled', () => {
        const markers = new LineMarkers()

        markers.animate(2, 0)
        markers.animate(2, 200)

        expect(markers.animate(2, 400))
            .toBe(false)
    })

    it('Should shrink markers that stopped being hovered', () => {
        const markers = new LineMarkers()

        markers.animate(2, 0)
        markers.animate(2, 200)

        expect(markers.animate(-1, 300))
            .toBe(true)
        expect(markers.animate(-1, 500))
            .toBe(false)
    })

    it('Should report a change when the hovered marker changes', () => {
        const markers = new LineMarkers()

        markers.animate(2, 0)
        markers.animate(2, 400)

        expect(markers.animate(3, 2000))
            .toBe(true)
    })
})
