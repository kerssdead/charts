import PlotProcess from '@/render/PlotProcess'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemText from '@/types/RenderItemText'
import PlotData from '@/types/data/PlotData'
import { PlotAxisType, PlotType } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const PIXEL = { x: 5000 / 800, y: 5000 / 500 }

function getTexts(data: Partial<PlotData>) {
    const process = new PlotProcess({ values: [], ...data } as PlotData, PIXEL, undefined)
    const items = QueueItemsBuilder.build(process.getData())

    return new Map(items.filter(item => item.key).map(item => [item.key!, item.shape as RenderItemText]))
}

function leftEdge(text: RenderItemText) {
    return text.absolute.x - text.value.length * text.fontSize / 4 * PIXEL.x
}

describe('Getting plot data', () => {
    it('Should keep first x-axis label right of y-axis labels', () => {
        const texts = getTexts({
            xType: PlotAxisType.Date,
            values: [{
                type: PlotType.Line,
                label: 'Orders',
                values: Array.from({ length: 60 }, (_, i) => ({ x: new Date(Date.UTC(2025, 0, 1 + i)).toISOString(), y: i * 10 }))
            }] as PlotData['values']
        })

        const yLabel = texts.get('y-label-0')!

        expect(leftEdge(texts.get('x-category-0')!))
            .toBeGreaterThan(yLabel.absolute.x)
    })
})