import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import Units from '@/helpers/Units'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import RenderItemLine from '@/types/RenderItemLine'
import RenderItemText from '@/types/RenderItemText'
import { addBarCapMarks } from '@/render/plot/PlotCapMarks'
import { FadeEdge, TextBaseline } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const UNITS = new Units({ x: 1, y: 1 })

const addMarks = (height: number, end: number = 1000) => {
    let marks!: ReturnType<typeof addBarCapMarks>

    QueueItemsBuilder.build((items: QueueItemsBuilder) => {
        marks = addBarCapMarks(items, UNITS, { span: { start: 100, end: 100 + height }, edge: end, value: 1234 })
    })

    return marks
}

describe('Adding bar cap marks', () => {
    it('Should fade the end of the bar', () => {
        const fade = addMarks(20).fade.shape as RenderItemRectangle

        expect([fade.absolute, fade.fadeEdge])
            .toEqual([{ x: 988, y: 100, width: 12, height: 20 }, FadeEdge.Right])
    })

    it('Should place a rightward caret after the bar end', () => {
        const caret = addMarks(20).caret.shape as RenderItemLine

        expect(caret.absolute)
            .toEqual([{ x: 1003, y: 106 }, { x: 1007, y: 110 }, { x: 1003, y: 114 }])
    })

    it('Should show the short real value after the caret when it fits', () => {
        const value = addMarks(20).value?.shape as RenderItemText

        expect([value.value, value.absolute, value.baseline])
            .toEqual(['1.2K', { x: 1009, y: 110 }, TextBaseline.Middle])
    })

    it('Should hide the value when the bar is thinner than the text', () => {
        expect(addMarks(8).value)
            .toBeNull()
    })

    it('Should hide the value when it would leave the canvas', () => {
        expect(addMarks(20, 4990).value)
            .toBeNull()
    })
})
