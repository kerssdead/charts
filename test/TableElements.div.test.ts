import { div } from '@/export/TableElements'
import { AriaRole, Attribute } from '@/static/Enums'
import { FakeElement, installFakeDocument } from './FakeDocument'

const create = (...args: Parameters<typeof div>) => div(...args) as unknown as FakeElement

describe('Creating table div', () => {
    beforeEach(installFakeDocument)

    it('Should create an empty div without class and role', () => {
        const element = create()

        expect([element.tagName, element.classes.size, element.attributes.size, element.children.length])
            .toEqual(['div', 0, 0, 0])
    })

    it('Should add the class name', () => {
        expect([...create('o-table').classes])
            .toEqual(['o-table'])
    })

    it('Should set the role', () => {
        expect(create(undefined, [], AriaRole.Row).getAttribute(Attribute.Role))
            .toBe(AriaRole.Row)
    })

    it('Should append children in order', () => {
        const first = create('first')
        const second = create('second')

        const element = create(undefined, [first, second] as unknown as HTMLElement[])

        expect(element.children)
            .toEqual([first, second])
    })
})