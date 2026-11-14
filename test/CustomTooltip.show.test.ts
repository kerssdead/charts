import CustomTooltip from '@/renderer/CustomTooltip'
import { FakeElement, installFakeDocument } from './FakeDocument'
import Theme from '@/Theme'

jest.mock('@/Theme', () => ({
    glass: '#ffffff80',
    glassEdge: '#ffffffbf',
    glassHighlight: '#ffffffe5',
    glassShadow: '#1e283c14',
    text: '#000000'
}))

class FakeTemplate extends FakeElement {
    innerHTML = '<b>${ Name }</b>'

    constructor() {
        super('template')
    }
}

const install = () => {
    const body = installFakeDocument()

    const createElement = document.createElement.bind(document) as (tagName: string) => FakeElement

    Object.assign(document, {
        createElement: (tagName: string) => {
            const element = createElement(tagName)

            Object.assign(element, {
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 }),
                offsetWidth: 0,
                offsetHeight: 0
            })

            return element
        }
    })

    Object.assign(document, {
        documentElement: { clientWidth: 800, clientHeight: 600 },
        fullscreenElement: undefined,
        getElementById: () => null
    })

    const canvas = new FakeElement('canvas')

    Object.assign(canvas, {
        getBoundingClientRect: () => ({ left: 10, top: 20, width: 100, height: 100 }),
        clientWidth: 100,
        clientHeight: 100,
        closest: () => null
    })

    Object.assign(globalThis, {
        window: {
            devicePixelRatio: 1,
            visualViewport: undefined,
            addEventListener: () => undefined
        },
        ResizeObserver: class {
            observe = jest.fn()

            disconnect = jest.fn()
        }
    })

    return {
        body,
        canvas: canvas as unknown as HTMLCanvasElement
    }
}

afterEach(() => {
    for (const name of ['document', 'window', 'ResizeObserver', 'HTMLTemplateElement'])
        delete (globalThis as Record<string, unknown>)[name]
})

describe('Building custom tooltip from template', () => {
    it('Should return nothing for a missing template', () => {
        install()

        Object.assign(globalThis, { HTMLTemplateElement: class { } })

        expect(CustomTooltip.fromTemplate('missing'))
            .toBeNull()
    })

    it('Should fill the template placeholders with escaped data', () => {
        install()

        Object.assign(globalThis, { HTMLTemplateElement: FakeTemplate })

        ;(globalThis as unknown as { document: { getElementById: (id: string) => FakeTemplate } }).document.getElementById = () => new FakeTemplate()

        const fill = CustomTooltip.fromTemplate('tooltip')

        expect(fill)
            .not.toBeNull()
        expect(fill!({ Name: 'First & Last' }))
            .toBe('<b>First &amp; Last</b>')
        expect(fill!({ Name: 'Second' }))
            .toBe('<b>Second</b>')
    })
})

describe('Building custom tooltip from text', () => {
    it('Should escape the text', () => {
        expect(CustomTooltip.fromText('<b>Bold</b>'))
            .toContain('&lt;b&gt;Bold&lt;/b&gt;')
    })
})

describe('Showing custom tooltip', () => {
    it('Should show the html in a floating element', () => {
        const { body, canvas } = install()

        const tooltip = new CustomTooltip(canvas)

        tooltip.show('<div>Tip</div>', { x: 10, y: 20 })

        const element = body.elements.find(element => element.getAttribute('role') === 'tooltip')

        expect(element)
            .toBeDefined()
        expect(element?.innerHTML)
            .toBe('<div>Tip</div>')
        expect(element?.style.pointerEvents)
            .toBe('none')
    })

    it('Should reuse the element for the same html', () => {
        const { body, canvas } = install()

        const tooltip = new CustomTooltip(canvas)

        tooltip.show('<div>Tip</div>', { x: 10, y: 20 })
        tooltip.show('<div>Tip</div>', { x: 30, y: 40 })

        expect(body.elements.filter(element => element.getAttribute('role') === 'tooltip'))
            .toHaveLength(1)
    })

    it('Should change the element opacity', () => {
        const { canvas } = install()

        const tooltip = new CustomTooltip(canvas)

        tooltip.show('<div>Tip</div>', { x: 0, y: 0 })
        tooltip.setOpacity(.5)

        expect((tooltip as unknown as { floating: { element: { style: { opacity: string } } } }).floating.element.style.opacity)
            .toBe('0.5')

        tooltip.setOpacity(.25)

        expect((tooltip as unknown as { floating: { element: { style: { opacity: string } } } }).floating.element.style.opacity)
            .toBe('0.25')
    })

    it('Should hide the element', () => {
        const { body, canvas } = install()

        const tooltip = new CustomTooltip(canvas)

        tooltip.show('<div>Tip</div>', { x: 0, y: 0 })
        tooltip.hide()

        expect(body.elements.find(element => element.getAttribute('role') === 'tooltip'))
            .toBeUndefined()
        expect((tooltip as unknown as { floating: unknown }).floating)
            .toBeNull()
    })
})
