import { cell } from '@/export/TableElements'
import { AriaRole, Attribute } from '@/static/Enums'
import { FakeElement, installFakeDocument } from './FakeDocument'

const create = (...args: Parameters<typeof cell>) => cell(...args) as unknown as FakeElement

describe('Creating table cell', () => {
    beforeEach(installFakeDocument)

    it('Should show the value with the same tooltip', () => {
        const element = create('Lorem')

        expect([element.textContent, element.title])
            .toEqual(['Lorem', 'Lorem'])
    })

    it('Should have the cell role by default', () => {
        expect(create('Lorem').getAttribute(Attribute.Role))
            .toBe(AriaRole.Cell)
    })

    it('Should use the given role', () => {
        expect(create('Lorem', AriaRole.ColumnHeader).getAttribute(Attribute.Role))
            .toBe(AriaRole.ColumnHeader)
    })

    it('Should use the given tooltip', () => {
        expect(create('10', AriaRole.Cell, 'Total: 10').title)
            .toBe('Total: 10')
    })
})