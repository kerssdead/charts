import { keepState } from '@/charts/SettingsState'
import { ChartType } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'
import TreeBarData from '@/types/data/TreeBarData'
import TreeBarRow from '@/types/TreeBarRow'
import Sector from '@/types/Sector'

const treeBar = (expanded?: boolean) => ({
    type: ChartType.TreeBar,
    data: { values: [new TreeBarRow({ id: 'a', label: 'A', expanded })] }
})

const create = (...charts: object[]) => ({ charts }) as unknown as ChartSettings

const isExpanded = (settings: ChartSettings) => (settings.charts[0].data as TreeBarData).values[0].expanded

describe('Keeping chart state', () => {
    it('Should keep tree bar state for chart of same type', () => {
        const next = create(treeBar())

        keepState(create(treeBar(true)), next)

        expect(isExpanded(next))
            .toBe(true)
    })

    it('Should not keep state when chart type changes', () => {
        const next = create(treeBar())
        const previous = create({ type: ChartType.Pie, data: { values: [new Sector({ id: 'a', label: 'A' })] } })

        keepState(previous, next)

        expect(isExpanded(next))
            .toBeUndefined()
    })

    it('Should keep disabled values', () => {
        const value = () => new Sector({ id: 'A-0', label: 'A' })
        const previous = create({ type: ChartType.Pie, data: { values: [value()] } })
        const next = create({ type: ChartType.Pie, data: { values: [value()] } })

        previous.charts[0].data.values[0].disabled = true

        keepState(previous, next)

        expect(next.charts[0].data.values[0].disabled)
            .toBe(true)
    })

    it('Should accept charts without previous chart', () => {
        expect(() => keepState(create(), create(treeBar(), treeBar())))
            .not
            .toThrow()
    })
})