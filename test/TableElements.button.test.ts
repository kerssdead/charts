import { button } from '@/export/TableElements'
import { TableClasses, Tag } from '@/static/Enums'
import { FakeElement, installFakeDocument } from './FakeDocument'

describe('Creating table action button', () => {
    beforeEach(installFakeDocument)

    it('Should create a non-submitting button with text and action class', () => {
        const element = button('Copy', () => {}) as unknown as FakeElement

        expect([element.tagName, element.type, element.textContent, [...element.classes]])
            .toEqual([Tag.Button, 'button', 'Copy', [TableClasses.Action]])
    })

    it('Should pass itself to the click handler', () => {
        const onClick = jest.fn()
        const element = button('Copy', onClick) as unknown as FakeElement

        element.click()

        expect(onClick)
            .toHaveBeenCalledWith(element)
    })
})