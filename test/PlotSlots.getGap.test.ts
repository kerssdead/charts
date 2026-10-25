import { getGap } from '@/render/plot/PlotSlots'

describe('Getting plot slot gap', () => {
    it('Should take a fifth of slot size', () => {
        expect(getGap(400, 4))
            .toBe(20)
    })

    it('Should not exceed maximal gap', () => {
        expect(getGap(10000, 2))
            .toBe(30)
    })

    it('Should treat zero slots as one slot', () => {
        expect(getGap(100, 0))
            .toBe(20)
    })
})