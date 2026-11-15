import { isPixelBusy } from '@/helpers/Canvas'

describe('Checking busy pixel', () => {
    it('Should compare the pixel with the theme background', () => {
        expect([isPixelBusy(1, 2), isPixelBusy(2, 2)])
            .toEqual([true, false])
    })
})