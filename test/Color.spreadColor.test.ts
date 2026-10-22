import { spreadColor } from '@/helpers/Color'

const spread = (base: string, count: number) => Array.from({ length: count }, (_, index) => spreadColor(base, index, count, 67))

describe('Spreading color', () => {
    it('Should keep base for single value', () => {
        expect(spread('#000000', 1))
            .toStrictEqual(['#000000'])
    })

    it('Should spread around mid-tone base', () => {
        expect(spread('#808080', 3))
            .toStrictEqual(['#3d3d3d', '#808080', '#c3c3c3'])
    })

    it('Should spread black upwards', () => {
        expect(spread('#000000', 3))
            .toStrictEqual(['#000000', '#434343', '#868686'])
    })

    it('Should spread white downwards', () => {
        expect(spread('#ffffff', 3))
            .toStrictEqual(['#797979', '#bcbcbc', '#ffffff'])
    })

    it('Should give distinct colors for black base', () => {
        expect(new Set(spread('#000000', 100)).size)
            .toBe(100)
    })

    it('Should use window edges for two values', () => {
        expect(spread('#000000', 2))
            .toStrictEqual(['#000000', '#868686'])
    })

    it('Should shift partially for near-black base', () => {
        expect(spread('#101010', 3))
            .toStrictEqual(['#000000', '#434343', '#868686'])
    })

    it('Should not shift when channels touch both limits', () => {
        expect(spread('#ff0000', 3))
            .toStrictEqual(['#bc0000', '#ff0000', '#ff4343'])
    })

    it('Should expand short hex base', () => {
        expect(spread('#000', 3))
            .toStrictEqual(['#000000', '#434343', '#868686'])
    })

    it('Should keep alpha', () => {
        expect(spread('#00000080', 3))
            .toStrictEqual(['#00000080', '#43434380', '#86868680'])
    })

    it('Should keep alpha for short hex base', () => {
        expect(spread('#0008', 3))
            .toStrictEqual(['#00000088', '#43434388', '#86868688'])
    })

    it('Should return non-hex base unchanged', () => {
        expect(spread('red', 3))
            .toStrictEqual(['red', 'red', 'red'])
    })

    it('Should keep base for zero range', () => {
        expect(Array.from({ length: 3 }, (_, index) => spreadColor('#336699', index, 3, 0)))
            .toStrictEqual(['#336699', '#336699', '#336699'])
    })
})