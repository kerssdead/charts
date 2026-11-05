import { getDateTicks } from '@/helpers/DateTicks'

const time = (year: number, month: number, day: number, hours = 0) => new Date(year, month, day, hours).getTime()

describe('Getting date ticks', () => {
    it('Should step by days', () => {
        expect(getDateTicks(time(2025, 0, 3), time(2025, 0, 20), 10))
            .toEqual([3, 5, 7, 9, 11, 13, 15, 17, 19].map(day => time(2025, 0, day)))
    })

    it('Should start from next midnight', () => {
        expect(getDateTicks(time(2025, 0, 3, 12), time(2025, 0, 20), 10)[0])
            .toBe(time(2025, 0, 4))
    })

    it('Should step by weeks', () => {
        expect(getDateTicks(time(2025, 0, 1), time(2025, 2, 30), 10))
            .toEqual([
                time(2025, 0, 1),
                time(2025, 0, 15),
                time(2025, 0, 29),
                time(2025, 1, 12),
                time(2025, 1, 26),
                time(2025, 2, 12),
                time(2025, 2, 26)
            ])
    })

    it('Should step by months aligned to step', () => {
        expect(getDateTicks(time(2025, 0, 15), time(2025, 11, 20), 10))
            .toEqual([2, 4, 6, 8, 10].map(month => time(2025, month, 1)))
    })

    it('Should step by years aligned to step', () => {
        expect(getDateTicks(time(1990, 4, 1), time(2025, 1, 1), 10))
            .toEqual([1995, 2000, 2005, 2010, 2015, 2020, 2025].map(year => time(year, 0, 1)))
    })

    it('Should return min for empty range', () => {
        expect(getDateTicks(time(2025, 0, 1), time(2025, 0, 1), 10))
            .toEqual([time(2025, 0, 1)])
    })
})