import { image } from './RenderItemImageTestData'

describe('Morphing image', () => {
    it('Should take the previous position from another image', () => {
        const item = image()
        const previous = image()

        previous.absolute = { x: 100, y: 200 }

        expect(item.morphFrom(previous, 1))
            .toBe(true)
        expect(item.from)
            .toEqual({ x: 100, y: 200 })
    })

    it('Should not morph from a different shape', () => {
        const item = image()

        expect(item.morphFrom({} as never, 1))
            .toBe(false)
    })
})