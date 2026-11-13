import { getDateTicks } from '@/helpers/DateTicks'

const time = (...parts: [number, number, number, number?, number?, number?]) => new Date(...parts).getTime()

describe('Getting date ticks', () => {
    it('Should step by seconds for 1 minute range', () => {
        expect(getDateTicks(time(2025, 0, 5, 9, 17), time(2025, 0, 5, 9, 18), 10))
            .toEqual([
                time(2025, 0, 5, 9, 17),
                time(2025, 0, 5, 9, 17, 15),
                time(2025, 0, 5, 9, 17, 30),
                time(2025, 0, 5, 9, 17, 45),
                time(2025, 0, 5, 9, 18)
            ])
    })

    it('Should step by minutes aligned to step for 1 hour range', () => {
        expect(getDateTicks(time(2025, 0, 5, 9, 17), time(2025, 0, 5, 10, 17), 10))
            .toEqual(
                [[9, 30], [9, 45], [10, 0], [10, 15]].map(([hours, minutes]) => time(2025, 0, 5, hours, minutes))
            )
    })

    it('Should step by hours for 6 hours range', () => {
        expect(getDateTicks(time(2025, 0, 5, 9, 17), time(2025, 0, 5, 15, 17), 10))
            .toEqual([10, 11, 12, 13, 14, 15].map(hours => time(2025, 0, 5, hours)))
    })

    it('Should step by hours aligned to step across days', () => {
        expect(getDateTicks(time(2025, 0, 5, 9, 17), time(2025, 0, 7, 9, 17), 10))
            .toEqual([
                time(2025, 0, 5, 12),
                time(2025, 0, 5, 18),
                time(2025, 0, 6),
                time(2025, 0, 6, 6),
                time(2025, 0, 6, 12),
                time(2025, 0, 6, 18),
                time(2025, 0, 7),
                time(2025, 0, 7, 6)
            ])
    })

    it('Should keep minute ticks inside range during repeated DST hour', () => {
        const timeZone = process.env.TZ
        process.env.TZ = 'America/New_York'

        try {
            expect(getDateTicks(Date.UTC(2025, 10, 2, 6, 20), Date.UTC(2025, 10, 2, 7, 20), 5))
                .toEqual([30, 45, 60, 75].map(minutes => Date.UTC(2025, 10, 2, 6, minutes)))
        } finally {
            process.env.TZ = timeZone
        }
    })

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