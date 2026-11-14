import { getValuesWithChildren } from '@/charts/ChartDefinitions'
import { ChartType } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'
import Sector from '@/types/Sector'
import TreeBarRow from '@/types/TreeBarRow'

describe('Getting values with children', () => {
    it('Should get top level values of flat charts', () => {
        const values = [new Sector({ id: 'a' }), new Sector({ id: 'b' })]

        expect(getValuesWithChildren({ type: ChartType.Pie, data: { values } }))
            .toEqual(values)
    })

    it('Should get nested tree bar rows', () => {
        const child = new TreeBarRow({ id: 'b' })
        const parent = new TreeBarRow({ id: 'a', children: [child] })

        expect(getValuesWithChildren({ type: ChartType.TreeBar, data: { values: [parent] } }))
            .toEqual([parent, child])
    })

    it('Should get no values for chart without data', () => {
        expect(getValuesWithChildren({ type: ChartType.Pie } as ChartItem))
            .toEqual([])
    })
})