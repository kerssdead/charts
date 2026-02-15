import * as Helper from 'Helper'

describe('Calculating rounded values', () => {
    it('Should be 5 in (w/o zero value) and 5 out values with 200 diff', () => {
        expect(Helper.getRoundedValues([111, 222, 333, 444, 555]))
            .toStrictEqual([0, 200, 400, 600, 800])
    })

    it('Should be 5 in and 5 out values with 200 diff', () => {
        expect(Helper.getRoundedValues([0, 165.44, 709.2, 444.32, 20.44]))
            .toStrictEqual([0, 200, 400, 600, 800])
    })

    it('Should be 2 in (w/o zero value) and 3 out values with 700 diff', () => {
        expect(Helper.getRoundedValues([33, 1287]))
            .toStrictEqual([0, 700, 1400])
    })

    it('Should be 14 in (w/o zero value) and 5 out values with 1100 diff', () => {
        expect(Helper.getRoundedValues([12, 14, 4221, 14, 12, 421, 4, 21, 4, 12, 4122, 2222, 1234, 2211]))
            .toStrictEqual([0, 1100, 2200, 3300, 4400])
    })

    it('Should be 4 in (w/o zero value) and 5 out values with 300 diff', () => {
        expect(Helper.getRoundedValues([-222, -76, 22, 344]))
            .toStrictEqual([-300, 0, 300, 600, 900])
    })

    it('Should be 8 in (w/o zero value) and 5 values with 170 diff', () => {
        expect(Helper.getRoundedValues([-12, -55, -211, -26, -99, -505, -123, 12]))
            .toStrictEqual([-510, -340, -170, 0, 170])
    })

    it('Should be 5 in (w/o zero value) and 5 values with 1.1 diff', () => {
        expect(Helper.getRoundedValues([1.2, 4.2, 0.5, 1.22, 3.4]))
            .toStrictEqual([0, 1.1, 2.2, 3.3, 4.4])
    })

    it('Should be 4 in and 5 values with 2.5 diff', () => {
        expect(Helper.getRoundedValues([2.4, 0, 3.3, 9.82]))
            .toStrictEqual([0, 2.5, 5, 7.5, 10])
    })

    it('Should be 5 in (w/o zero value) and 5 values with 4.4 diff', () => {
        expect(Helper.getRoundedValues([-1.2, 4.5, 6.66, 2.5, -8.76]))
            .toStrictEqual([-8.8, -4.4, 0, 4.4, 8.8])
    })
})