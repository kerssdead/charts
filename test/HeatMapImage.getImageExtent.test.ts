import { ImageCrossOrigin } from '@/static/Enums'

jest.mock('@/helpers/Images', () => ({
    getImage: jest.fn(),
    onImageLoad: jest.fn()
}))

type Listener = () => void

const load = () => {
    jest.resetModules()

    const images = jest.requireMock('@/helpers/Images') as { getImage: jest.Mock, onImageLoad: jest.Mock }
    const listeners: Listener[] = []

    images.getImage.mockReturnValue(null)
    images.onImageLoad.mockImplementation((listener: Listener) => {
        listeners.push(listener)

        return () => listeners.splice(listeners.indexOf(listener), 1)
    })

    const { getImageExtent } = jest.requireActual('@/render/heatMap/HeatMapImage')

    return { getImageExtent, images, listeners }
}

const request = (url: string, owner: object, onLoad?: () => void) => {
    return { url, crossOrigin: ImageCrossOrigin.Anonymous, owner, onLoad }
}

describe('Getting the extent of an image', () => {
    afterEach(() => jest.useRealTimers())

    it('Should give the natural size of a loaded image', () => {
        const { getImageExtent, images } = load()

        images.getImage.mockReturnValue({ naturalWidth: 640, naturalHeight: 480 })

        expect(getImageExtent(request('a.png', {}, jest.fn())))
            .toEqual({ width: 640, height: 480 })
    })

    it('Should ask for the image with the given cross origin', () => {
        const { getImageExtent, images } = load()

        getImageExtent(request('a.png', {}))

        expect(images.getImage)
            .toHaveBeenCalledWith('a.png', ImageCrossOrigin.Anonymous)
    })

    it('Should give nothing while the image is loading', () => {
        const { getImageExtent } = load()

        expect(getImageExtent(request('a.png', {}, jest.fn())))
            .toBeNull()
    })

    it('Should not listen when nobody wants to know about the load', () => {
        const { getImageExtent, listeners } = load()

        getImageExtent(request('a.png', {}))

        expect(listeners)
            .toHaveLength(0)
    })

    it('Should call back once after the image has loaded', async () => {
        const { getImageExtent, images, listeners } = load()
        const onLoad = jest.fn()

        getImageExtent(request('a.png', {}, onLoad))

        images.getImage.mockReturnValue({ naturalWidth: 1, naturalHeight: 1 })
        listeners.forEach(listener => listener())

        expect(onLoad)
            .not.toHaveBeenCalled()

        await Promise.resolve()

        expect(onLoad)
            .toHaveBeenCalledTimes(1)
        expect(listeners)
            .toHaveLength(0)
    })

    it('Should call back every chart that waits for the same image', async () => {
        const { getImageExtent, images, listeners } = load()
        const first = jest.fn()
        const second = jest.fn()

        getImageExtent(request('a.png', {}, first))
        getImageExtent(request('a.png', {}, second))

        images.getImage.mockReturnValue({ naturalWidth: 1, naturalHeight: 1 })
        listeners.forEach(listener => listener())
        await Promise.resolve()

        expect(first)
            .toHaveBeenCalledTimes(1)
        expect(second)
            .toHaveBeenCalledTimes(1)
    })

    it('Should call a callback shared by several panels once', async () => {
        const { getImageExtent, images, listeners } = load()
        const shared = jest.fn()

        getImageExtent(request('a.png', {}, shared))
        getImageExtent(request('a.png', {}, shared))
        getImageExtent(request('b.png', {}, shared))

        images.getImage.mockReturnValue({ naturalWidth: 1, naturalHeight: 1 })
        listeners.forEach(listener => listener())
        await Promise.resolve()

        expect(shared)
            .toHaveBeenCalledTimes(1)
    })

    it('Should call only the latest callback of one owner', async () => {
        const { getImageExtent, images, listeners } = load()
        const owner = {}
        const stale = jest.fn()
        const fresh = jest.fn()

        getImageExtent(request('a.png', owner, stale))
        getImageExtent(request('a.png', owner, fresh))

        images.getImage.mockReturnValue({ naturalWidth: 1, naturalHeight: 1 })
        listeners.forEach(listener => listener())
        await Promise.resolve()

        expect(stale)
            .not.toHaveBeenCalled()
        expect(fresh)
            .toHaveBeenCalledTimes(1)
    })

    it('Should wait until every waited image has loaded', async () => {
        const { getImageExtent, images, listeners } = load()
        const onLoad = jest.fn()

        getImageExtent(request('a.png', {}, onLoad))
        getImageExtent(request('b.png', {}, onLoad))

        images.getImage.mockImplementation((url: string) => url === 'a.png' ? { naturalWidth: 1, naturalHeight: 1 } : null)
        listeners.forEach(listener => listener())
        await Promise.resolve()

        expect(onLoad)
            .not.toHaveBeenCalled()

        images.getImage.mockReturnValue({ naturalWidth: 1, naturalHeight: 1 })
        listeners.forEach(listener => listener())
        await Promise.resolve()

        expect(onLoad)
            .toHaveBeenCalledTimes(1)
    })

    it('Should not wait forever for an image that does not load', async () => {
        jest.useFakeTimers()

        const { getImageExtent, images, listeners } = load()
        const onLoad = jest.fn()

        getImageExtent(request('a.png', {}, onLoad))
        getImageExtent(request('broken.png', {}, onLoad))

        images.getImage.mockImplementation((url: string) => url === 'a.png' ? { naturalWidth: 1, naturalHeight: 1 } : null)
        listeners.forEach(listener => listener())
        jest.advanceTimersByTime(1500)
        await Promise.resolve()

        expect(onLoad)
            .toHaveBeenCalledTimes(1)
    })
})