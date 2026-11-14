import LegendValues from '@/legend/LegendValues'
import ViewState from '@/charts/ViewState'
import Value from '@/types/base/Value'
import ChartSettings from '@/types/ChartSettings'
import { AnimationTiming } from '@/static/constants/Index'

jest.mock('@/charts/ChartDefinitions', () => ({ hasLegend: () => true }))

class ToggleableValue extends Value {
    override canToggle() {
        return true
    }
}

const settings = (values: Value[]) => {
    return {
        charts: [{ data: { values } }],
        staticMode: false
    } as unknown as ChartSettings
}

const value = (id: string) => {
    const result = new Value({ label: id })

    result.id = id

    return result
}

const create = (values: Value[] = [value('a')]) => {
    return new LegendValues(settings(values), new ViewState())
}

describe('Applying legend values settings', () => {
    it('Should take the values of the new settings', () => {
        const values = create()

        values.apply(settings([value('a'), value('b')]))

        expect(values.getVisible().map(item => item.label))
            .toEqual(['a', 'b'])
    })
})

describe('Updating legend value toggles', () => {
    it('Should start the toggle timer and remove it when finished', () => {
        const values = create([new ToggleableValue({ label: 'a' })])
        const toggled = new ToggleableValue({ label: 'a' })

        toggled.id = 'a'

        expect(values.toggle(toggled))
            .toBe(true)
        expect(values.isToggling)
            .toBe(true)

        values.updateToggles(100)

        expect(values.isToggling)
            .toBe(true)

        values.updateToggles(100 + AnimationTiming.legend)

        expect(values.isToggling)
            .toBe(false)
    })

    it('Should keep the toggle until the animation is over', () => {
        const values = create([new ToggleableValue({ label: 'a' })])
        const toggled = new ToggleableValue({ label: 'a' })

        toggled.id = 'a'
        values.toggle(toggled)
        values.updateToggles(100)
        values.updateToggles(100 + AnimationTiming.legend - 1)

        expect(values.isToggling)
            .toBe(true)
    })
})

describe('Clearing legend value toggles', () => {
    it('Should drop all toggles', () => {
        const values = create([new ToggleableValue({ label: 'a' })])
        const toggled = new ToggleableValue({ label: 'a' })

        toggled.id = 'a'
        values.toggle(toggled)
        values.clear()

        expect(values.isToggling)
            .toBe(false)
    })
})
