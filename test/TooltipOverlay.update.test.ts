import TooltipOverlay from '@/renderer/TooltipOverlay'
import CustomTooltip from '@/renderer/CustomTooltip'
import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import CanvasWindow from '@/types/CanvasWindow'
import Frame from '@/renderer/Frame'
import ChartSettings from '@/types/ChartSettings'
import ItemData from '@/types/ItemData'
import { LIGHT_THEME, ThemePalette } from '@/Theme'
import { DARK_THEME } from './TestTheme'

const WINDOW = new CanvasWindow(100, 100)

const overlay = () => {
    const result = new TooltipOverlay({} as HTMLCanvasElement)

    jest.spyOn(result.custom, 'show').mockImplementation()
    jest.spyOn(result.custom, 'setOpacity').mockImplementation()
    jest.spyOn(result.custom, 'hide').mockImplementation()

    return result
}

const item = (tooltipText: string | undefined) => {
    const shape = new RenderItemRectangle()

    shape.canvas = { x: 50, y: 50, width: 100, height: 100, radii: [0, 0, 0, 0] }

    const result = new RenderItem(shape)

    result.tooltipTemplate = tooltipText

    return result
}

const frame = (
    queue: Queue,
    mouse: { x: number, y: number } | null,
    context: unknown = null,
    theme: ThemePalette = LIGHT_THEME
) => {
    return {
        queue,
        window: WINDOW,
        screen: WINDOW,
        mouse,
        context,
        now: 0,
        theme,
        isInstant: false
    } as unknown as Frame
}

describe('Applying tooltip settings', () => {
    it('Should enable and disable the tooltip', () => {
        const target = overlay()

        target.apply({ enableTooltip: true } as ChartSettings)

        expect(target.isEnabled)
            .toBe(true)

        target.apply({ enableTooltip: false } as ChartSettings)

        expect(target.isEnabled)
            .toBe(false)
    })
})

describe('Updating tooltip overlay', () => {
    it('Should clear the tooltip while a context menu is open', () => {
        const target = overlay()

        target.isEnabled = true

        expect(target.update(frame(new Queue({} as CanvasRenderingContext2D), null, {})))
            .toBe(false)
        expect(target.custom.hide)
            .toHaveBeenCalled()
    })

    it('Should clear the tooltip when disabled', () => {
        const target = overlay()

        expect(target.update(frame(new Queue({} as CanvasRenderingContext2D), null)))
            .toBe(false)
        expect(target.custom.hide)
            .toHaveBeenCalled()
    })

    it('Should hide the tooltip without a mouse', () => {
        const target = overlay()

        target.isEnabled = true

        expect(target.update(frame(new Queue({} as CanvasRenderingContext2D), null)))
            .toBe(false)
        expect(target.custom.hide)
            .toHaveBeenCalled()
    })

    it('Should show a built-in tooltip over the hovered item', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)

        queue.add([item('<b>Tip</b>')])

        const target = overlay()

        target.isEnabled = true

        target.update(frame(queue, { x: 75, y: 75 }))

        expect(target.custom.show)
            .toHaveBeenCalledWith(expect.stringContaining('&lt;b&gt;Tip&lt;/b&gt;'), { x: 75, y: 75 })
        expect(target.custom.setOpacity)
            .toHaveBeenCalled()
    })

    it('Should use the theme colours for the tooltip', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)

        queue.add([item('<b>Tip</b>')])

        const target = overlay()

        target.isEnabled = true
        target.update(frame(queue, { x: 75, y: 75 }, null, DARK_THEME))

        const html = (target.custom.show as jest.Mock).mock.calls[0][0] as string

        expect(html)
            .toContain(DARK_THEME.background)
        expect(html)
            .toContain(DARK_THEME.text)
    })

    it('Should reuse the scan for the same point and queue', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)

        queue.add([item('<b>Tip</b>')])

        const target = overlay()

        target.isEnabled = true

        const findTop = jest.spyOn(queue, 'findTop')

        target.update(frame(queue, { x: 75, y: 75 }))
        target.update(frame(queue, { x: 75, y: 75 }))

        expect(findTop)
            .toHaveBeenCalledTimes(1)
    })
})

describe('Resetting tooltip overlay', () => {
    it('Should clear the tooltip and drop the template', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)
        const target = overlay()

        target.template = () => '<b>x</b>'
        target.reset(queue)

        expect(target.template)
            .toBeNull()
        expect(target.custom.hide)
            .toHaveBeenCalled()
    })
})

class Template {
    reads = 0

    get innerHTML() {
        this.reads++

        return '<b>${ Name }</b>'
    }
}

let template: Template

const getShownHtml = (data: ItemData | null, tooltipText: string, templateId?: string) => {
    const queue = new Queue({} as CanvasRenderingContext2D)
    const shape = new RenderItemRectangle()

    shape.canvas = { x: 50, y: 50, width: 100, height: 100, radii: [0, 0, 0, 0] }

    const item = new RenderItem(shape)

    item.data = data
    item.tooltipTemplate = tooltipText
    queue.add([item])

    const target = overlay()

    target.isEnabled = true
    target.template = templateId ? CustomTooltip.fromTemplate(templateId) : null
    target.update(frame(queue, { x: 75, y: 75 }))

    return (target.custom.show as jest.Mock).mock.calls[0]?.[0]
}

describe('Showing custom tooltip', () => {
    beforeEach(() => {
        template = new Template()

        Object.assign(globalThis, {
            HTMLTemplateElement: Template,
            document: { getElementById: () => template }
        })
    })

    afterEach(() => {
        delete (globalThis as Record<string, unknown>).HTMLTemplateElement
        delete (globalThis as Record<string, unknown>).document
    })

    it('Should fill user template with item data', () => {
        expect(getShownHtml({ Name: 'First' }, 'Built-in', 'template'))
            .toBe('<b>First</b>')
    })

    it('Should show escaped built-in text without user template', () => {
        expect(getShownHtml({ Name: 'First' }, '<i>Built-in</i>'))
            .toContain('>&lt;i&gt;Built-in&lt;/i&gt;</div>')
    })

    it('Should show built-in text when item has no data', () => {
        expect(getShownHtml(null, 'Built-in', 'template'))
            .toContain('>Built-in</div>')
    })

    it('Should fill template once per data', () => {
        const fill = CustomTooltip.fromTemplate('template')
        const data = { Name: 'First' }

        fill?.(data)
        fill?.(data)

        expect(template.reads)
            .toBe(1)
        expect(fill?.({ Name: 'Second' }))
            .toBe('<b>Second</b>')
        expect(template.reads)
            .toBe(2)
    })
})
