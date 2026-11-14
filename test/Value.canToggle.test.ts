import Value from '@/types/base/Value'

describe('Toggling base values', () => {
    it('Should not allow toggling a plain value', () => {
        expect(new Value({}).canToggle())
            .toBe(false)
    })
})
