import { getStackKey } from '@/render/plot/PlotColumnGroups'

describe('Getting plot stack key', () => {
    it('Should split stacks by x and sign', () => {
        expect(getStackKey({ x: 'a', y: 5 }))
            .toBe('a+')
        expect(getStackKey({ x: 'a', y: -5 }))
            .toBe('a-')
    })

    it('Should treat zero as positive', () => {
        expect(getStackKey({ x: 3, y: '0' }))
            .toBe('3+')
    })
})