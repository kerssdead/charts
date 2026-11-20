import TableHint from '@/ui/TableHint'
import TextResources from '@/static/TextResources'
import { Attribute, Tag } from '@/static/Enums'
import { FakeElement, installFakeDocument } from './FakeDocument'

const create = () => {
    installFakeDocument()

    const parent = new FakeElement(Tag.Div)
    const canvas = new FakeElement(Tag.Canvas)
    const hint = new TableHint(parent as unknown as HTMLElement, canvas as unknown as HTMLCanvasElement)

    return { parent, canvas, hint }
}

describe('Applying table hint', () => {
    it('Should describe the canvas by the hint text', () => {
        const { parent, canvas, hint } = create()

        hint.apply(true)

        const element = parent.elements[0]

        expect([element.text, canvas.getAttribute(Attribute.AriaDescribedBy)])
            .toEqual([TextResources.decomposeToTable, element.id])
    })

    it('Should unlink the canvas when the table is not available', () => {
        const { parent, canvas, hint } = create()

        hint.apply(true)
        hint.apply(false)

        expect([parent.elements[0].text, canvas.getAttribute(Attribute.AriaDescribedBy)])
            .toEqual(['', null])
    })

    it('Should remove the hint element', () => {
        const { parent, hint } = create()

        hint.remove()

        expect(parent.elements)
            .toEqual([])
    })

    it('Should give every hint its own id', () => {
        const ids = [create(), create()].map(({ parent }) => parent.elements[0].id)

        expect(ids[0])
            .not.toBe(ids[1])
    })
})