import { getHorizontalPlacement } from '@/legend/LegendLayout'
import { LegendPlace } from '@/static/Enums'
import { sectors } from './LegendLayoutTestData'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string) => text.length * 10
}))

const place = (labels: string[], overrides: object = {}, size = { width: 400, height: 400 }) => {
    return getHorizontalPlacement(size, {
        values: sectors(...labels),
        place: LegendPlace.Bottom,
        top: 0,
        buttonWidth: 0,
        ...overrides
    })
}

describe('Placing legend horizontally', () => {
    it('Should center one row of entries', () => {
        const { entries } = place(['A', 'B'])

        expect(entries.map(entry => entry.x))
            .toEqual([154, 206])
    })

    it('Should put the area at the bottom', () => {
        const { area } = place(['A'])

        expect([area.y, area.height])
            .toEqual([372, 28])
    })

    it('Should put the area below the top offset when placed on top', () => {
        const { area } = place(['A'], { place: LegendPlace.Top, top: 30 })

        expect(area.y)
            .toBe(30)
    })

    it('Should wrap entries to the next row when they do not fit', () => {
        const { entries, area } = place(['AAAA', 'BBBB', 'CCCC'], {}, { width: 200, height: 400 })

        expect([entries.map(entry => entry.y), area.height])
            .toEqual([[352, 352, 376], 52])
    })

    it('Should drop entries that do not fit into the allowed rows', () => {
        const { entries } = place(['AAAA', 'BBBB', 'CCCC'], {}, { width: 100, height: 40 })

        expect(entries)
            .toHaveLength(1)
    })

    it('Should keep one empty row without values', () => {
        const { entries, area } = place([])

        expect([entries.length, area.height])
            .toEqual([0, 28])
    })

    it('Should leave room for the button', () => {
        const { entries } = place(['AAAAAAAAAAAAAA'], { buttonWidth: 100 }, { width: 300, height: 400 })

        expect(entries[0].width)
            .toBeLessThanOrEqual(52)
    })
})
