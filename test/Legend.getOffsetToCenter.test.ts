import Value from '../src/types/base/Value'
import Legend from '../src/Legend'

describe('Get offset to center', () => {
    it('Should close to 100 pixels', () => {
        const items = [
            {
                label: 'Sector 1'
            } as Value,
            {
                label: 'Cell 2'
            } as Value,
            {
                label: 'Sector 3'
            } as Value
        ]

        expect(Legend.getOffsetToCenter(items, 500))
            .toBeCloseTo(94, 0)
    })

    it('Should be min offset', () => {
        const items = [
            {
                label: 'Sector 1'
            } as Value,
            {
                label: 'Cell 2'
            } as Value,
            {
                label: 'Sector 3'
            } as Value,
            {
                label: 'Cell 4'
            } as Value,
            {
                label: 'Sector 5'
            } as Value,
            {
                label: 'Cell 6'
            } as Value,
            {
                label: 'Sector 7'
            } as Value
        ]

        expect(Legend.getOffsetToCenter(items, 200))
            .toBe(90)
    })

    it('Should be single centered', () => {
        const items = [
            {
                label: 'Sector 1'
            } as Value
        ]

        expect(Legend.getOffsetToCenter(items, 1000))
            .toBeCloseTo(439, 0)
    })
})