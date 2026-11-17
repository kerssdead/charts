import Layout from '@/renderer/Layout'
import ChartItem from '@/types/ChartItem'
import { ChartType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({ stringWidth: (text: string, font: number = 14) => text.length * font / 2 }))

const chart = (title?: string) => ({ type: ChartType.Pie, title, data: { values: [] } }) as ChartItem

const layout = () => {
    const result = new Layout()

    result.width = 400
    result.height = 400
    result.update({})

    return result
}

describe('Getting layout panels', () => {
    it('Should fill the window with a single chart', () => {
        const [panel] = layout().getPanels([chart()])

        expect([panel.window.width, panel.window.height])
            .toEqual([400, 400])
    })

    it('Should reserve space for the title of a chart', () => {
        const [titled, plain] = layout().getPanels([chart('Title'), chart()], 2)

        expect(titled.window.height)
            .toBeLessThan(plain.window.height)
    })

    it('Should place charts in the requested number of columns', () => {
        const panels = layout().getPanels([chart(), chart(), chart()], 1)

        expect(panels.map(panel => panel.window.x))
            .toEqual([0, 0, 0])
    })
})
