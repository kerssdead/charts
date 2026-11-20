import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import Units from '@/helpers/Units'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import RenderItemLine from '@/types/RenderItemLine'
import RenderItemText from '@/types/RenderItemText'
import { addColumnCapMarks } from '@/render/plot/PlotCapMarks'
import { FadeEdge } from '@/static/Enums'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string | undefined, font: number = 14) => (text?.length ?? 0) * font / 2
}))

const UNITS = new Units({ x: 1, y: 1 })

const addMarks = (width: number, top: number = 100, value: number = 1234) => {
    let marks!: ReturnType<typeof addColumnCapMarks>

    QueueItemsBuilder.build((items: QueueItemsBuilder) => {
        marks = addColumnCapMarks(items, UNITS, { span: { start: 10, end: 10 + width }, edge: top, value })
    })

    return marks
}

describe('Adding column cap marks', () => {
    it('Should fade the top of the column', () => {
        const fade = addMarks(40).fade.shape as RenderItemRectangle

        expect([fade.absolute, fade.fadeEdge, fade.isFill])
            .toEqual([{ x: 10, y: 100, width: 40, height: 12 }, FadeEdge.Top, true])
    })

    it('Should place an upward caret above the column centre', () => {
        const caret = addMarks(40).caret.shape as RenderItemLine

        expect(caret.absolute)
            .toEqual([{ x: 26, y: 97 }, { x: 30, y: 93 }, { x: 34, y: 97 }])
    })

    it('Should show the short real value above the caret when it fits', () => {
        const value = addMarks(40).value?.shape as RenderItemText

        expect([value.value, value.absolute])
            .toEqual(['1.2K', { x: 30, y: 91 }])
    })

    it('Should hide the value when it is wider than the column', () => {
        expect(addMarks(10).value)
            .toBeNull()
    })

    it('Should hide the value when there is no room above the plot', () => {
        expect(addMarks(40, 15).value)
            .toBeNull()
    })
})
