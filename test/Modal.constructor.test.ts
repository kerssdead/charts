import Modal from '@/ui/Modal'
import { FakeElement, installFakeDocument } from './FakeDocument'
import { Attribute, Tag } from '@/static/Enums'
import TextResources from '@/static/TextResources'
import { setFontFamily, SYSTEM_FONT_FAMILY } from '@/static/Typography'

const create = (isDark?: boolean) => {
    const body = installFakeDocument()

    const modal = new Modal(undefined, 'Title', isDark)

    const element = body.elements[0] as FakeElement

    element.showModal = jest.fn()
    element.close = jest.fn()

    return { modal, element, body }
}

const closeButton = (element: FakeElement) => {
    const header = element.elements.find(child => child.tagName === Tag.Div)

    return header?.elements.find(child => child.tagName === Tag.Button) as FakeElement
}

describe('Creating modal', () => {
    afterEach(() => setFontFamily(undefined))

    it('Should not use the dark theme by default', () => {
        expect([...create().element.classes])
            .toEqual(['o-modal'])
    })

    it('Should use the dark theme when requested', () => {
        expect([...create(true).element.classes])
            .toEqual(['o-modal', 'o-dark'])
    })

    it('Should use the system font family by default', () => {
        expect(create().element.style.fontFamily)
            .toBe(SYSTEM_FONT_FAMILY)
    })

    it('Should use the chart font family', () => {
        setFontFamily('Georgia')

        expect(create().element.style.fontFamily)
            .toBe('Georgia')
    })
})

describe('Opening modal', () => {
    it('Should show the dialog', () => {
        const { modal, element } = create()

        modal.open()

        expect(element.showModal)
            .toHaveBeenCalledTimes(1)
    })
})

describe('Closing modal', () => {
    it('Should close and remove the dialog', () => {
        const { modal, element, body } = create()

        modal.close()

        expect(element.close)
            .toHaveBeenCalledTimes(1)
        expect(body.elements)
            .not.toContain(element)
    })

    it('Should close only once', () => {
        const { modal, element } = create()

        modal.close()
        modal.close()

        expect(element.close)
            .toHaveBeenCalledTimes(1)
    })

    it('Should close from the close button', () => {
        const { element, body } = create()

        closeButton(element).click()

        expect(element.close)
            .toHaveBeenCalledTimes(1)
        expect(body.elements)
            .not.toContain(element)
    })

    it('Should close on cancel event', () => {
        const { element, body } = create()

        element.oncancel?.()

        expect(element.close)
            .toHaveBeenCalledTimes(1)
        expect(body.elements)
            .not.toContain(element)
    })
})

describe('Modal content', () => {
    it('Should append the content element', () => {
        const body = installFakeDocument()
        const content = new FakeElement('div')

        new Modal(content as unknown as HTMLElement, 'Title')

        const modal = body.elements[0] as FakeElement

        expect(modal.text)
            .toContain('Title')
        expect(modal.elements.some(element => element.elements.includes(content)))
            .toBe(true)
    })

    it('Should create the header without a title', () => {
        const body = installFakeDocument()

        new Modal(undefined, undefined)

        const header = (body.elements[0] as FakeElement).elements.find(child => child.tagName === Tag.Div)

        expect(header?.elements.find(child => child.tagName === Tag.Span)?.textContent)
            .toBe('')
    })

    it('Should name the close button', () => {
        const { element } = create()

        expect(closeButton(element).getAttribute(Attribute.AriaLabel))
            .toBe(TextResources.close)
    })

    it('Should label the dialog with its title', () => {
        const { element } = create()

        const title = element.elements[0].elements.find(child => child.tagName === Tag.Span) as FakeElement

        expect([title.id !== '', element.getAttribute(Attribute.AriaLabelledBy)])
            .toEqual([true, title.id])
    })

    it('Should give every dialog title its own id', () => {
        const ids = [create(), create()].map(({ element }) => element.getAttribute(Attribute.AriaLabelledBy))

        expect(ids[0])
            .not.toBe(ids[1])
    })

    it('Should not label the dialog without a title', () => {
        const body = installFakeDocument()

        new Modal(undefined, undefined)

        expect((body.elements[0] as FakeElement).getAttribute(Attribute.AriaLabelledBy))
            .toBeNull()
    })
})