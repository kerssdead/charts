import { getGroupKey } from '@/helpers/ValueKeys'
import Sector from '@/types/Sector'

const value = new Sector({ id: 'lorem-id', label: 'Lorem', labelIndex: 2, value: 1 })

describe('Getting value group key', () => {
    it('Should use value id for a single chart', () => {
        expect(getGroupKey(value, false))
            .toBe('lorem-id')
    })

    it('Should use label and label index for shared charts', () => {
        expect(getGroupKey(value, true))
            .toBe('Lorem-2')
    })
})