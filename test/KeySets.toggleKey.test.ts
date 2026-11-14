import { toggleKey } from '@/helpers/KeySets'

describe('Toggling key', () => {
    it('Should add missing key and remove present key', () => {
        const keys = new Set(['a'])

        toggleKey(keys, 'b')
        toggleKey(keys, 'a')

        expect([...keys])
            .toEqual(['b'])
    })
})