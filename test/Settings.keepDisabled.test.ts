import { keepDisabled, normalize } from '@/helpers/Settings'
import { ChartType } from '@/static/Enums'
import ChartSettings from '@/types/ChartSettings'

describe('Keeping disabled values', () => {
    const create = (disabled?: boolean) => normalize({
        type: ChartType.Pie,
        data: { values: [{ label: 'A', value: 1, disabled }, { label: 'B', value: 1 }] }
    } as unknown as ChartSettings)

    it('Should keep value disabled between settings', () => {
        const next = create()

        keepDisabled(create(true), next)

        expect(next.charts[0].data.values.map(value => !!value.disabled))
            .toEqual([true, false])
    })

    it('Should respect explicit disabled value', () => {
        const next = create(false)

        keepDisabled(create(true), next)

        expect(next.charts[0].data.values[0].disabled)
            .toBe(false)
    })
})