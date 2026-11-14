import { prepareSectors } from '@/helpers/ValuePreparation'
import Data from '@/types/interfaces/Data'
import Value from '@/types/base/Value'
import Sector from '@/types/Sector'
import PlotSeries from '@/types/PlotSeries'
import TextResources from '@/static/TextResources'

const prepare = (values: object[]) => {
    const data = { values } as Data

    prepareSectors(data)

    return data.values
}

describe('Preparing sectors', () => {
    it('Should wrap plain values into sectors', () => {
        expect(prepare([{ label: 'A', value: 1 }])[0])
            .toBeInstanceOf(Sector)
    })

    it('Should keep existing value instances', () => {
        const series = new PlotSeries({ label: 'A' })

        expect(prepare([series])[0])
            .toBe(series)
    })

    it('Should default missing labels', () => {
        expect(prepare([{ value: 1 }, { label: '', value: 2 }]).map(value => value.label))
            .toEqual([TextResources.noLabel, TextResources.noLabel])
    })

    it('Should count same labels and build ids from them', () => {
        const values = prepare([{ label: 'A' }, { label: 'B' }, { label: 'A' }])

        expect(values.map(value => [value.labelIndex, value.id]))
            .toEqual([[0, 'A-0'], [0, 'B-0'], [1, 'A-1']])
    })

    it('Should keep defined ids', () => {
        expect(prepare([new Value({ label: 'A', id: 'custom' })])[0].id)
            .toBe('custom')
    })
})