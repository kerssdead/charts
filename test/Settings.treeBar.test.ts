import { normalize } from '@/charts/Settings'
import { ChartType } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'
import TreeBarData from '@/types/data/TreeBarData'
import TreeBarRow from '@/types/TreeBarRow'
import Sector from '@/types/Sector'

const settings = (data: object, baseColor?: string, numberLocale?: string) => {
    return normalize({ type: ChartType.TreeBar, data, baseColor, numberLocale } as unknown as ChartSettings)
}

const rows = (result: ChartSettings) => (result.charts[0].data as TreeBarData).values

describe('Normalizing tree bar settings', () => {
    it('Should prepare nested rows and parts', () => {
        const result = settings({
            values: [{ label: 'Lorem', parts: [{ value: '5' }], children: [{ label: 'Ipsum', parts: [{ value: 2 }] }] }]
        })

        const [root] = rows(result)
        const child = root.children?.[0]

        expect([root instanceof TreeBarRow, child instanceof TreeBarRow, root.parts[0] instanceof Sector])
            .toEqual([true, true, true])
        expect([root.parts[0].value, root.parts[0].label, child?.id])
            .toEqual([5, undefined, 'Ipsum-0'])
    })

    it('Should parse parts and keep number locale for cells', () => {
        const result = settings({ values: [{ label: 'Lorem', parts: [{ value: '1.500' }] }] }, undefined, 'de-DE')

        expect([rows(result)[0].parts[0].value, (result.charts[0].data as TreeBarData).numberLocale])
            .toEqual([1500, 'de-DE'])
    })

    it('Should inherit colors from parent rows and base color', () => {
        const [root] = rows(settings({
            values: [{
                label: 'Lorem',
                parts: [{ value: 1 }],
                children: [{ label: 'Ipsum', color: '#ff0000', parts: [{ value: 1 }, { value: 1, color: '#00ff00' }] }]
            }]
        }, '#336699'))

        const child = root.children?.[0]

        expect([root.parts[0].color, child?.parts[0].color, child?.parts[1].color])
            .toEqual(['#336699', '#ff0000', '#00ff00'])
    })
})