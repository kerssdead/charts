import { getAccessibleName } from '@/charts/AccessibleName'
import TextResources from '@/static/TextResources'
import ChartSettings from '@/types/ChartSettings'

const name = (settings: object) => getAccessibleName({ charts: [], ...settings } as unknown as ChartSettings)

const pie = (values: object[], title?: string) => ({ type: 'pie', title, data: { values } })

describe('Getting accessible name', () => {
    it('Should prefer the caller label', () => {
        expect(name({ ariaLabel: 'Custom', title: 'Title', charts: [pie([{ label: 'A', value: 1 }])] }))
            .toBe('Custom')
    })

    it('Should join title with labels and values', () => {
        expect(name({ title: 'Share', charts: [pie([{ label: 'North', value: 40 }, { label: 'South', value: 25 }])] }))
            .toBe('Share. North 40.00, South 25.00')
    })

    it('Should use labels only for values without a number', () => {
        expect(name({ charts: [{ type: 'plot', data: { values: [{ label: 'Line' }, { label: 'Column' }] } }] }))
            .toBe('Line, Column')
    })

    it('Should format values with postfix and decimals', () => {
        expect(name({ valuePostfix: '%', decimals: 1, charts: [pie([{ label: 'A', value: 12.34 }])] }))
            .toBe('A 12.3%')
    })

    it('Should name every chart of a group', () => {
        const charts = [pie([{ label: 'A', value: 1 }], 'First'), pie([{ label: 'B', value: 2 }], 'Second')]

        expect(name({ title: 'Group', charts }))
            .toBe('Group. First: A 1.00. Second: B 2.00')
    })

    it('Should shorten long lists', () => {
        const values = Array.from({ length: 10 }, (_, index) => ({ label: `L${ index }` }))

        expect(name({ charts: [pie(values)] }))
            .toBe('L0, L1, L2, L3, L4, L5, L6, L7, …')
    })

    it('Should fall back to a generic name', () => {
        expect(name({}))
            .toBe(TextResources.defaultImageName)
    })
})