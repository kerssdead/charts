import PlotSection from '@/render/plot/PlotSection'
import { getSlots } from '@/render/plot/PlotSlots'
import PlotSeries from '@/types/PlotSeries'
import { PlotAxisType, PlotOrientation } from '@/static/Enums'

const SLOTS = getSlots(
    [{ values: Array.from({ length: 4 }, (_, i) => ({ x: i, y: 1 })) } as PlotSeries],
    PlotAxisType.Number
)

const BAND = { top: 100, bottom: 1100 }

const create = (orientation: PlotOrientation, values = [0, 50, 100]) =>
    new PlotSection(orientation, SLOTS, values, BAND, 50, 1000)

describe('Creating plot section', () => {
    it('Should place vertical categories from left and values from bottom', () => {
        const section = create(PlotOrientation.Vertical)

        expect(section.categoryScale.getSlotStart(0))
            .toBe(80)
        expect(section.valueScale.getCoordinate(100))
            .toBe(100)
    })

    it('Should place horizontal categories from bottom and values from left', () => {
        const section = create(PlotOrientation.Horizontal)

        expect(section.categoryScale.getSlotStart(0))
            .toBe(1070)
        expect(section.valueScale.getCoordinate(100))
            .toBe(1050)
    })

    it('Should put baseline at zero value', () => {
        expect(create(PlotOrientation.Vertical).baseline)
            .toBe(1100)
        expect(create(PlotOrientation.Vertical, [-50, 0, 50]).baseline)
            .toBe(600)
        expect(create(PlotOrientation.Horizontal).baseline)
            .toBe(50)
    })

    it('Should keep band', () => {
        expect(create(PlotOrientation.Vertical).band)
            .toBe(BAND)
    })
})