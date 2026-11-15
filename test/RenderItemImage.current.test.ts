import { image } from './RenderItemImageTestData'

describe('Getting current image position', () => {
    it('Should return the absolute position by default', () => {
        expect(image().current())
            .toEqual({ x: 1000, y: 2000 })
    })

    it('Should interpolate from the previous position while morphing', () => {
        const item = image()

        item.from = { x: 0, y: 0 }

        expect(item.current(.5))
            .toEqual({ x: 500, y: 1000 })
    })
})