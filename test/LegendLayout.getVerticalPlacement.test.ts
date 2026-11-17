import { getVerticalPlacement } from '@/legend/LegendLayout'
import { LegendPlace } from '@/static/Enums'
import { sectors } from './LegendLayoutTestData'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string) => text.length * 10
}))

const place = (labels: string[], overrides: object = {}, size = { width: 400, height: 400 }) => {
    return getVerticalPlacement(size, {
        values: sectors(...labels),
        place: LegendPlace.Left,
        top: 0,
        buttonWidth: 0,
        ...overrides
    })
}

describe('Placing legend vertically', () => {
    it('Should size the area by the widest entry and place it on the left', () => {
        const { area } = place(['A', 'B'])

        expect([area.x, area.y, area.width, area.height])
            .toEqual([0, 0, 64, 400])
    })

    it('Should place the area on the right', () => {
        const { area } = place(['A', 'B'], { place: LegendPlace.Right })

        expect(area.x)
            .toBe(336)
    })

    it('Should center entries in the area', () => {
        const { entries } = place(['A', 'B'])

        expect(entries.map(entry => [entry.x, entry.y]))
            .toEqual([[12, 178], [12, 202]])
    })

    it('Should limit the area width and truncate long labels', () => {
        const { area, entries } = place(['A'.repeat(40)])

        expect([area.width, entries[0].label.endsWith('…')])
            .toEqual([100, true])
    })

    it('Should keep only entries that fit the height', () => {
        const { entries } = place(['A', 'B', 'C'], {}, { width: 400, height: 40 })

        expect(entries)
            .toHaveLength(1)
    })

    it('Should start below the top offset', () => {
        const { area, entries } = place(['A'], { top: 50 })

        expect([area.y, entries[0].y >= 50])
            .toEqual([50, true])
    })

    it('Should leave room for the button', () => {
        const { entries } = place(['A', 'B', 'C'], { buttonWidth: 30 }, { width: 400, height: 60 })

        expect(entries)
            .toHaveLength(1)
    })

    it('Should widen the area for the button', () => {
        const { area } = place(['A'], { buttonWidth: 100 })

        expect(area.width)
            .toBe(124)
    })
})
