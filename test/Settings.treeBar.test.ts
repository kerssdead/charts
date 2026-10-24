import { keepState, normalize } from '@/helpers/Settings'
import { ChartType } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'
import TreeBarData from '@/types/data/TreeBarData'
import TreeBarRow from '@/types/TreeBarRow'
import Sector from '@/types/Sector'

const FALLBACK = '#808080'

const settings = (data: object, baseColor?: string) =>
    normalize({ type: ChartType.TreeBar, data, baseColor } as unknown as ChartSettings, FALLBACK)

const rows = (result: ChartSettings) => (result.charts[0].data as TreeBarData).values

describe('Normalizing tree bar settings', () => {
    it('Should prepare nested rows and parts', () => {
        const result = settings({
            values: [{ label: 'Lorem', parts: [{ value: '5' }], children: [{ label: 'Ipsum', parts: [{ value: 2 }] }] }]
        })

        const [root] = rows(result)
        const child = root.children![0]

        expect([root instanceof TreeBarRow, child instanceof TreeBarRow, root.parts[0] instanceof Sector])
            .toEqual([true, true, true])
        expect([root.parts[0].value, root.parts[0].label, child.id])
            .toEqual([5, undefined, 'Ipsum-0'])
    })

    it('Should inherit colors from parent rows and base color', () => {
        const [root] = rows(settings({
            values: [{
                label: 'Lorem',
                parts: [{ value: 1 }],
                children: [{ label: 'Ipsum', color: '#ff0000', parts: [{ value: 1 }, { value: 1, color: '#00ff00' }] }]
            }]
        }, '#336699'))

        const child = root.children![0]

        expect([root.parts[0].color, child.parts[0].color, child.parts[1].color])
            .toEqual(['#336699', '#ff0000', '#00ff00'])
    })

    it('Should keep expanded and sort state between settings', () => {
        const data = () => ({ values: [{ id: 'a', label: 'Lorem', children: [{ id: 'b', label: 'Ipsum' }] }] })

        const previous = settings(data())
        const next = settings(data())

        rows(previous)[0].expanded = true;
        (previous.charts[0].data as TreeBarData).sortColumn = 'amount'

        keepState(previous, next)

        expect([rows(next)[0].expanded, (next.charts[0].data as TreeBarData).sortColumn])
            .toEqual([true, 'amount'])
    })

    it('Should prefer explicit expanded state from new settings', () => {
        const previous = settings({ values: [{ id: 'a', label: 'Lorem', expanded: true }] })
        const next = settings({ values: [{ id: 'a', label: 'Lorem', expanded: false }] })

        keepState(previous, next)

        expect(rows(next)[0].expanded)
            .toBe(false)
    })
})
