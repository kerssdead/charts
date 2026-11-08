import { firstMappedValue } from '@/helpers/Collections'

describe('Finding first mapped value', () => {
    it('Should return value of the first key present in the map', () => {
        const map = new Map([['b', 2], ['c', 3]])

        expect(firstMappedValue(['a', 'c', 'b'], map))
            .toBe(3)
    })

    it('Should return undefined when no key is present in the map', () => {
        expect(firstMappedValue(['a'], new Map([['b', 2]])))
            .toBeUndefined()
    })
})