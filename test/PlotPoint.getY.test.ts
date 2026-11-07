import { getY } from '@/types/PlotPoint'

describe('Getting plot point y', () => {
    it('Should return number for numeric y', () => {
        expect([getY({ x: 1, y: 5 }), getY({ x: 1, y: '7' }), getY({ x: 1, y: 0 })])
            .toEqual([5, 7, 0])
    })

    it('Should return null for missing y', () => {
        expect(getY({ x: 1, y: null }))
            .toBeNull()
    })
})