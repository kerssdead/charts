import { fieldData, fieldItem, WINDOW } from './RenderItemFieldTestData'

const aliveField = () => {
    return fieldData([1, 2, 3, 4], {
        alive: true,
        diffusion: { sources: Float32Array.from([1, 2, 3, 4]), sigmaX: 1, sigmaY: 1 }
    })
}

describe('Animating a field on frames', () => {
    it('Should not animate a field that is not alive', () => {
        const item = fieldItem()

        item.adjust(WINDOW)

        expect(item.animateHover(null, 100))
            .toBe(false)
    })

    it('Should not animate without a field', () => {
        expect(fieldItem(null).animateHover(null, 100))
            .toBe(false)
    })

    it('Should not animate an alive field that has nothing to spread', () => {
        const item = fieldItem(fieldData([1, 2, 3], { alive: true }))

        item.adjust(WINDOW)

        expect(item.animateHover(null, 100))
            .toBe(false)
    })

    it('Should keep animating an alive field', () => {
        const item = fieldItem(aliveField())

        item.adjust(WINDOW)

        expect(item.animateHover(null, 100))
            .toBe(true)
        expect(item.animateHover({ x: 250, y: 425 }, 116))
            .toBe(true)
    })

    it('Should not animate instantly drawn frames', () => {
        const item = fieldItem(aliveField())

        item.adjust(WINDOW)

        expect(item.animateHover(null, 100, true))
            .toBe(false)
    })
})