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

    it('Should be 14 in (w/o zero value) and 7 out values with 390 diff', () => {
        expect(Helper.getRoundedValues([12, 14, 4221, 14, 12, 421, 4, 21, 4, 12, 4122, 2222, 1234, 2211]))
            .toStrictEqual([0, 710, 1420, 2130, 2840, 3550, 4260])
    })

    it('Should be 4 in (w/o zero value) and 6 out values with 120 diff', () => {
        expect(Helper.getRoundedValues([-222, -76, 22, 344]))
            .toStrictEqual([-240, -120, 0, 120, 240, 360])
    })

    it('Should be 8 in (w/o zero value) and 9 values with 90 diff', () => {
        expect(Helper.getRoundedValues([-12, -55, -211, -26, -99, -505, -123, 12]))
            .toStrictEqual([-540, -450, -360, -270, -180, -90, 0, 90])
    })

    it('Should be 5 in (w/o zero value) and 5 values with 0.8 diff', () => {
        expect(Helper.getRoundedValues([1.2, 4.2, 0.5, 1.22, 3.4]))
            .toStrictEqual([0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8])
    })

    it('Should be 4 in and 5 values with 2.5 diff', () => {
        expect(Helper.getRoundedValues([2.4, 0, 3.3, 9.82]))
            .toStrictEqual([0, 2.5, 5, 7.5, 10])
    })

    it('Should be 5 in (w/o zero value) and 5 values with 2.3 diff', () => {
        expect(Helper.getRoundedValues([-1.2, 4.5, 6.66, 2.5, -8.76]))
            .toStrictEqual([-9.2, -6.9, -4.6, -2.3, 0, 2.3, 4.6, 6.9])
    })
})