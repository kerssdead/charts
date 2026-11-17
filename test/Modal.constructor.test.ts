import Modal from '@/ui/Modal'
import { FakeElement, installFakeDocument } from './FakeDocument'
import { Tag } from '@/static/Enums'

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
    it('Should not use the dark theme by default', () => {
        expect([...create().element.classes])
            .toEqual(['o-modal'])
    })

    it('Should use the dark theme when requested', () => {
        expect([...create(true).element.classes])
            .toEqual(['o-modal', 'o-dark'])
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
})