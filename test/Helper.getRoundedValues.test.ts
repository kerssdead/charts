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

    it('Should be 80 in (w/0 zero value) and 5 values with 460,000 diff. Negative zero case', () => {
        expect(Helper.getRoundedValues([-1.00,
            736.00,
            648.00,
            2376.00,
            5472.00,
            8928.00,
            11892.00,
            14124.00,
            28996.00,
            29716.00,
            33589.00,
            41583.00,
            48711.50,
            63117.50,
            67702.00,
            72743.50,
            87530.50,
            99128.50,
            104856.00,
            127025.50,
            157152.75,
            181446.50,
            202530.50,
            228882.00,
            305540.00,
            331541.50,
            360627.25,
            398798.00,
            434518.75,
            471238.25,
            507687.75,
            548827.00,
            575840.00,
            607958.00,
            614310.25,
            635419.25,
            658884.50,
            680097.25,
            690902.75,
            709014.75,
            730951.75,
            758476.00,
            780098.75,
            809081.50,
            836926.00,
            875864.25,
            921235.75,
            952572.25,
            980691.25,
            1006462.00,
            1035981.50,
            1054127.25,
            1083202.00,
            1100993.50,
            1117436.50,
            1134447.50,
            1156118.00,
            1167559.25,
            1169768.75,
            1178592.75,
            1190191.75,
            1215574.00,
            1232856.50,
            1251152.25,
            1274163.50,
            1285752.00,
            1305887.25,
            1324244.00,
            1351230.75,
            1361983.50,
            1362263.50,
            1363336.00,
            1363476.00,
            1363812.00,
            1366900.50,
            1366965.00,
            1367223.00,
            1368061.50,
            100.00,
            0.00]))
            .toStrictEqual([-460000, 0, 460000, 920000, 1380000])
    })
})