import RenderItemImage from '@/types/RenderItemImage'
import { fieldData, fieldItem } from './RenderItemFieldTestData'

describe('Morphing field from previous', () => {
    it('Should morph from another field', () => {
        expect(fieldItem().morphFrom(fieldItem(), 1))
            .toBe(true)
    })

    it('Should not morph from another kind of shape', () => {
        expect(fieldItem().morphFrom(new RenderItemImage('a.png'), 1))
            .toBe(false)
    })

    it('Should not morph from a field without data', () => {
        expect(fieldItem().morphFrom(fieldItem(null), 1))
            .toBe(false)
    })

    it('Should not morph without data of its own', () => {
        expect(fieldItem(null).morphFrom(fieldItem(), 1))
            .toBe(false)
    })

    it('Should morph from fields of a different size', () => {
        expect(fieldItem(fieldData([1, 2, 3, 4])).morphFrom(fieldItem(fieldData([1, 2])), 1))
            .toBe(true)
    })
})