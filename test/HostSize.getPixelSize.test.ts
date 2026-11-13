import { getPixelSize } from '@/helpers/HostSize'

describe('Getting pixel size', () => {
    it('Should scale the size by the pixel ratio', () => {
        expect(getPixelSize({ width: 101, height: 51 }, 1.5))
            .toEqual({ width: 152, height: 77 })
    })

    it('Should use the device size when it matches the scaled size', () => {
        expect(getPixelSize({ width: 101, height: 51 }, 1.5, { inlineSize: 151, blockSize: 76 }))
            .toEqual({ width: 151, height: 76 })
    })

    it('Should ignore a device size that does not match the scaled size', () => {
        expect(getPixelSize({ width: 101, height: 51 }, 1.5, { inlineSize: 140, blockSize: 76 }))
            .toEqual({ width: 152, height: 77 })
    })
})