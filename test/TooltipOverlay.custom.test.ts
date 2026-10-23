import TooltipOverlay from '@/renderer/TooltipOverlay'
import CustomTooltip from '@/renderer/CustomTooltip'
import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import ItemData from '@/types/ItemData'
import CanvasWindow from '@/types/CanvasWindow'

jest.mock('@/Theme', () => ({}))

const WINDOW = { x: 0, y: 0, width: 100, height: 100 } as CanvasWindow

class Template {
    reads = 0

    get innerHTML() {
        this.reads++

        return '<b>${ Name }</b>'
    }
}

let template: Template

beforeEach(() => {
    template = new Template();

    (globalThis as any).HTMLTemplateElement = Template;
    (globalThis as any).document = { getElementById: () => template }
})

afterEach(() => {
    delete (globalThis as any).HTMLTemplateElement
    delete (globalThis as any).document
})

function getShownHtml(data: ItemData | null, tooltipHtml: string | null, templateId?: string) {
    const shape = new RenderItemRectangle()

    shape.canvas = { x: 50, y: 50, width: 100, height: 100, radii: [0, 0, 0, 0] }

    const item = new RenderItem(shape)

    item.data = data
    item.tooltipHtml = tooltipHtml

    const queue = new Queue({} as CanvasRenderingContext2D)

    queue.add([item])

    const overlay = new TooltipOverlay({} as HTMLCanvasElement)

    overlay.isEnabled = true
    overlay.template = templateId ? CustomTooltip.fromTemplate(templateId) : null

    const show = jest.spyOn(overlay.custom, 'show').mockImplementation()

    overlay.update({ queue, window: WINDOW, screen: WINDOW, mouse: { x: 10, y: 10 }, context: null, now: 0 })

    return show.mock.calls[0]?.[0]
}

describe('Showing custom tooltip', () => {
    it('Should fill user template with item data', () => {
        expect(getShownHtml({ Name: 'First' }, '<i>built-in</i>', 'template')).toBe('<b>First</b>')
    })

    it('Should show built-in html without user template', () => {
        expect(getShownHtml({ Name: 'First' }, '<i>built-in</i>')).toBe('<i>built-in</i>')
    })

    it('Should show built-in html when item has no data', () => {
        expect(getShownHtml(null, '<i>built-in</i>', 'template')).toBe('<i>built-in</i>')
    })

    it('Should fill template once per data', () => {
        const fill = CustomTooltip.fromTemplate('template')!
        const data = { Name: 'First' }

        fill(data)
        fill(data)

        expect(template.reads).toBe(1)
        expect(fill({ Name: 'Second' })).toBe('<b>Second</b>')
        expect(template.reads).toBe(2)
    })
})
