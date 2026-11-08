import { ImageCrossOrigin } from '@/static/Enums'

const RETRY_DELAY = 30000

const IMAGE_URL = 'https://example.com/a.png'

class FakeImage {
    static created: FakeImage[] = []

    crossOrigin: string | null = null

    src = ''

    onload: (() => void) | null = null

    onerror: (() => void) | null = null

    constructor() {
        FakeImage.created.push(this)
    }

    static last() {
        return FakeImage.created[FakeImage.created.length - 1]
    }
}

type ImagesModule = typeof import('@/helpers/Images')

let Images: ImagesModule

let warn: jest.SpyInstance

beforeEach(() => {
    jest.useFakeTimers({ now: 0 })
    jest.resetModules()

    FakeImage.created = [];
    (globalThis as any).Image = FakeImage

    warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

    Images = require('@/helpers/Images')
})

afterEach(() => {
    delete (globalThis as any).Image

    warn.mockRestore()
    jest.useRealTimers()
})

const fail = () => FakeImage.last().onerror!()

describe('Getting an image', () => {
    it('Should return null while loading and the image once loaded', () => {
        expect(Images.getImage(IMAGE_URL))
            .toBeNull()

        FakeImage.last().onload!()

        expect(Images.getImage(IMAGE_URL))
            .toBe(FakeImage.last())
    })

    it('Should request each url once while it is loading', () => {
        Images.getImage(IMAGE_URL)
        Images.getImage(IMAGE_URL)

        expect(FakeImage.created.map(image => image.src))
            .toEqual([IMAGE_URL])
    })

    it('Should notify load listeners', () => {
        const listener = jest.fn()

        Images.onImageLoad(listener)
        Images.getImage(IMAGE_URL)
        FakeImage.last().onload!()

        expect(listener)
            .toHaveBeenCalledTimes(1)
    })

    it('Should load without CORS by default when the CORS request fails', () => {
        Images.getImage(IMAGE_URL)
        fail()
        FakeImage.last().onload!()

        expect(FakeImage.created.map(image => image.crossOrigin))
            .toEqual([ImageCrossOrigin.Anonymous, null])
        expect(Images.getImage(IMAGE_URL))
            .toBe(FakeImage.last())
        expect(warn)
            .not.toHaveBeenCalled()
    })

    it('Should not fall back when the mode is set explicitly', () => {
        Images.getImage(IMAGE_URL, ImageCrossOrigin.Anonymous)
        fail()

        expect(FakeImage.created.length)
            .toBe(1)
        expect(warn.mock.calls[0].join(' '))
            .toContain('CORS')
    })

    it('Should load without the crossOrigin attribute in None mode', () => {
        Images.getImage(IMAGE_URL, ImageCrossOrigin.None)

        expect(FakeImage.last().crossOrigin)
            .toBeNull()
    })

    it('Should warn without a CORS hint when the fallback also fails', () => {
        Images.getImage(IMAGE_URL)
        fail()
        fail()

        expect(warn.mock.calls)
            .toEqual([['OCharts: image failed to load:', IMAGE_URL]])
    })

    it('Should not retry a failed image before the delay', () => {
        Images.getImage(IMAGE_URL, ImageCrossOrigin.None)
        fail()
        jest.setSystemTime(RETRY_DELAY - 1)

        expect(Images.getImage(IMAGE_URL, ImageCrossOrigin.None))
            .toBeNull()
        expect(FakeImage.created.length)
            .toBe(1)
    })

    it('Should retry a failed image after the delay', () => {
        Images.getImage(IMAGE_URL, ImageCrossOrigin.None)
        fail()
        jest.setSystemTime(RETRY_DELAY)
        Images.getImage(IMAGE_URL, ImageCrossOrigin.None)
        FakeImage.last().onload!()

        expect(Images.getImage(IMAGE_URL, ImageCrossOrigin.None))
            .toBe(FakeImage.last())
        expect(FakeImage.created.length)
            .toBe(2)
    })

    it('Should warn once per url and mode', () => {
        Images.getImage(IMAGE_URL, ImageCrossOrigin.None)
        fail()
        jest.setSystemTime(RETRY_DELAY)
        Images.getImage(IMAGE_URL, ImageCrossOrigin.None)
        fail()
        Images.getImage(IMAGE_URL, ImageCrossOrigin.Anonymous)
        fail()

        expect(warn)
            .toHaveBeenCalledTimes(2)
    })

    it('Should cache each mode separately', () => {
        Images.getImage(IMAGE_URL, ImageCrossOrigin.None)
        FakeImage.last().onload!()
        Images.getImage(IMAGE_URL, ImageCrossOrigin.Anonymous)

        expect(FakeImage.created.map(image => image.crossOrigin))
            .toEqual([null, ImageCrossOrigin.Anonymous])
        expect(Images.getImage(IMAGE_URL, ImageCrossOrigin.Anonymous))
            .toBeNull()
    })

    it('Should return null without an Image implementation', () => {
        delete (globalThis as any).Image

        expect(Images.getImage(IMAGE_URL))
            .toBeNull()
    })
})