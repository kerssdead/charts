import RenderItemRectangle from '@/types/RenderItemRectangle'

const rect = (y: number) => {
    const shape = new RenderItemRectangle()

    shape.absolute = { x: 10, y, width: 50, height: 20 }
    shape.clip = { x: 10, y, width: 100, height: 20, radius: 4 }

    return shape
}

describe('Morphing rectangle clip', () => {
    it('Should morph clip box together with rectangle', () => {
        const shape = rect(200)

        shape.morphFrom(rect(100), 1)

        expect([shape.current(.5).y, shape.currentClip(.5)!.y, shape.currentClip(1)!.y])
            .toEqual([150, 150, 200])
    })

    it('Should keep clip when previous rectangle has none', () => {
        const shape = rect(200)
        const previous = rect(100)

        previous.clip = null

        shape.morphFrom(previous, 1)

        expect(shape.currentClip(.5)!.y)
            .toBe(200)
    })
})
