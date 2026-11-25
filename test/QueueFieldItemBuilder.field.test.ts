import QueueFieldItemBuilder from '@/builders/QueueFieldItemBuilder'
import { fieldData } from './RenderItemFieldTestData'

describe('Giving field item its field', () => {
    it('Should keep the field on the shape', () => {
        const field = fieldData([1, 2])

        expect(new QueueFieldItemBuilder().field(field).shape.field)
            .toBe(field)
    })

    it('Should have no field until one is given', () => {
        expect(new QueueFieldItemBuilder().shape.field)
            .toBeNull()
    })

    it('Should return the builder to continue the chain', () => {
        const builder = new QueueFieldItemBuilder()

        expect(builder.field(fieldData([1])))
            .toBe(builder)
    })
})