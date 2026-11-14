import { prepareSeries } from '@/helpers/ValuePreparation'
import PlotData from '@/types/data/PlotData'
import PlotSeries from '@/types/PlotSeries'
import { PlotType } from '@/static/Enums'

const prepare = (values: object[]) => {
    const data = { values } as PlotData

    prepareSeries(data)

    return data.values
}

describe('Preparing plot series', () => {
    it('Should wrap plain values into plot series', () => {
        expect(prepare([{ label: 'A', values: [] }])[0])
            .toBeInstanceOf(PlotSeries)
    })

    it('Should default series type to line', () => {
        expect(prepare([{ label: 'A' }, { label: 'B', type: PlotType.Column }]).map(series => series.type))
            .toEqual([PlotType.Line, PlotType.Column])
    })

    it('Should default series type of existing instances', () => {
        expect(prepare([new PlotSeries({ label: 'A' })])[0].type)
            .toBe(PlotType.Line)
    })

    it('Should count same labels and build ids from them', () => {
        expect(prepare([{ label: 'A' }, { label: 'A' }]).map(series => series.id))
            .toEqual(['A-0', 'A-1'])
    })
})