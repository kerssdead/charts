import * as Helper from 'Helper'

describe('Calculating rounded values', () => {
    it('Should be 5 in (w/o zero value) and 7 out values with 100 diff', () => {
        expect(Helper.getRoundedValues([111, 222, 333, 444, 555]))
            .toStrictEqual([0, 100, 200, 300, 400, 500, 600])
    })

    it('Should be 5 in and 5 out values with 100 diff', () => {
        expect(Helper.getRoundedValues([0, 165.44, 709.2, 444.32, 20.44]))
            .toStrictEqual([0, 180, 360, 540, 720])
    })

    it('Should be 2 in (w/o zero value) and 3 out values with 650 diff', () => {
        expect(Helper.getRoundedValues([33, 1287]))
            .toStrictEqual([0, 650, 1300])
    })

    it('Should be 14 in (w/o zero value) and 11 out values with 390 diff', () => {
        expect(Helper.getRoundedValues([12, 14, 4221, 14, 12, 421, 4, 21, 4, 12, 4122, 2222, 1234, 2211]))
            .toStrictEqual([0, 710, 1420, 2130, 2840, 3550, 4260])
    })

    // ~! add negative values tests
})