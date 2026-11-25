import { getPackedAlpha, packColor } from '@/helpers/PackedColor'

describe('Getting the alpha of a packed color', () => {
    it('Should give the alpha byte', () => {
        expect(getPackedAlpha(packColor('#10203040')))
            .toBe(64)
    })

    it('Should give full alpha for an opaque color', () => {
        expect(getPackedAlpha(packColor('#102030')))
            .toBe(255)
    })

    it('Should give zero for a transparent color', () => {
        expect(getPackedAlpha(0))
            .toBe(0)
    })
})