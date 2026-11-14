import { mergeKeyFlags } from '@/helpers/KeySets'

describe('Merging key flags', () => {
    it('Should take explicit flags', () => {
        expect([...mergeKeyFlags([['a', true], ['b', false]], new Set(['b']))])
            .toEqual(['a'])
    })

    it('Should keep previous keys without explicit flag', () => {
        expect([...mergeKeyFlags([['a', undefined], ['b', undefined]], new Set(['a']))])
            .toEqual(['a'])
    })

    it('Should drop previous keys that are no longer listed', () => {
        expect([...mergeKeyFlags([['b', undefined]], new Set(['a']))])
            .toEqual([])
    })

    it('Should keep key set when any of its flags is set', () => {
        expect([...mergeKeyFlags([['a', false], ['a', true]], new Set())])
            .toEqual(['a'])
    })
})