import PlotProcess from '@/render/plot/PlotProcess'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemText from '@/types/RenderItemText'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import PlotData from '@/types/data/PlotData'
import { PlotAxisType, PlotType } from '@/static/Enums'
import ProcessSettings from '@/types/ProcessSettings'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const PIXEL = { x: 5000 / 800, y: 5000 / 500 }

const SETTINGS: ProcessSettings = { valuePostfix: undefined }

function getTexts(data: Partial<PlotData>) {
    const process = new PlotProcess({ values: [], ...data } as PlotData, PIXEL, SETTINGS)
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

    it('Should scale stacking columns to y-axis when yMax is less than stack total', () => {
        const values = [300, 280, 50, 35, 20]
        const process = new PlotProcess({
            yMax: 250,
            xType: PlotAxisType.Text,
            values: [
                { type: PlotType.StackingColumn, label: 'Apples', values: values.map((y, i) => ({ x: `Day ${ i }`, y: y.toString() })) },
                { type: PlotType.StackingColumn, label: 'Pears', values: values.map((_, i) => ({ x: `Day ${ i }`, y: i < 2 ? '15' : '0' })) }
            ]
        } as PlotData, PIXEL, SETTINGS)

        const rects = new Map(QueueItemsBuilder.build(process.getData())
                                               .filter(item => item.shape instanceof RenderItemRectangle)
                                               .map(item => [item.key!, item.shape as RenderItemRectangle]))

        values.forEach((y, i) =>
            expect(rects.get(`0-rect-${ i }`)!.absolute.height)
                .toBeCloseTo(process.getAxisY(0) - process.getAxisY(Math.min(y, 250))))
    })
})