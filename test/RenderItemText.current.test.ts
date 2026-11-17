import RenderItemText from '@/types/RenderItemText'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string) => text.length * 10
}))

const text = (angle: number) => {
    const result = new RenderItemText('a')

    result.angle = angle
    result.orbit = { x: 0, y: 0, radiusX: 10, radiusY: 10 }

    return result
}

describe('Getting current text position', () => {
    it('Should place the text on its orbit by default', () => {
        const point = text(0).current()

        expect([point.x, point.y])
            .toEqual([10, 0])
    })

    it('Should keep the own angle by default', () => {
        const next = text(Math.PI)

        next.morphFrom(text(0), 1)

        expect(next.currentAngle())
            .toBe(Math.PI)
    })
})
