import RenderItemRectangle from '@/types/RenderItemRectangle'

const clip = (y: number) => ({ x: 0, y, width: 10, height: 10, radius: 2 })

describe('Getting current rectangle clip', () => {
    it('Should return the clip as is by default', () => {
        const shape = new RenderItemRectangle()

        shape.clip = clip(5)
        shape.fromClip = clip(0)

        expect(shape.currentClip())
            .toEqual(clip(5))
    })

    it('Should have no clip without one', () => {
        expect(new RenderItemRectangle().currentClip(.5))
            .toBeNull()
    })

    it('Should interpolate the clip box and radius', () => {
        const shape = new RenderItemRectangle()

        shape.clip = { ...clip(10), radius: 4 }
        shape.fromClip = clip(0)

        expect(shape.currentClip(.5))
            .toEqual({ x: 0, y: 5, width: 10, height: 10, radius: 3 })
    })
})
