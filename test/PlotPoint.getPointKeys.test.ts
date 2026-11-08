import { getPointKeys } from '@/types/PlotPoint'

describe('Getting plot point keys', () => {
    it('Should key points by x', () => {
        expect(getPointKeys([{ x: 'A', y: 1 }, { x: 5, y: 2 }]))
            .toEqual(['A-0', '5-0'])
    })

    it('Should key dates by time', () => {
        const date = new Date(Date.UTC(2025, 0, 1))

        expect(getPointKeys([{ x: date, y: 1 }]))
            .toEqual([`${ date.getTime() }-0`])
    })

    it('Should count points sharing x', () => {
        expect(getPointKeys([{ x: 'A', y: 1 }, { x: 'B', y: 2 }, { x: 'A', y: 3 }]))
            .toEqual(['A-0', 'B-0', 'A-1'])
    })

    it('Should keep keys of existing points when point is inserted before', () => {
        expect(getPointKeys([{ x: 'A', y: 1 }, { x: 'B', y: 2 }]).slice(1))
            .toEqual(getPointKeys([{ x: 'B', y: 2 }]))
    })

    it('Should return empty array for no points', () => {
        expect(getPointKeys([]))
            .toEqual([])
    })
})