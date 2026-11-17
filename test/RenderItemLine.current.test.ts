import RenderItemLine from '@/types/RenderItemLine'

const line = (...ys: number[]) => {
    const shape = new RenderItemLine()

    shape.absolute = ys.map((y, i) => ({ x: i * 10, y }))

    return shape
}

describe('Getting current line stops', () => {
    it('Should return own stops by default', () => {
        const next = line(10, 20)

        next.morphFrom(line(0, 0), 1)

        expect(next.current())
            .toEqual([{ x: 0, y: 10 }, { x: 10, y: 20 }])
    })

    it('Should interpolate from the previous stops while morphing', () => {
        const next = line(10, 20)

        next.morphFrom(line(0, 0), 1)

        expect(next.current(.5))
            .toEqual([{ x: 0, y: 5 }, { x: 10, y: 10 }])
    })

    it('Should return own stops when the stop count changed', () => {
        const next = line(10, 20)

        next.morphFrom(line(0), 1)

        expect(next.current(.5))
            .toEqual([{ x: 0, y: 10 }, { x: 10, y: 20 }])
    })
})
