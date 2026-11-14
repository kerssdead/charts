import { onImageLoad, getImage } from '@/helpers/Images'

class FakeImage {
    onload: (() => void) | null = null

    onerror: (() => void) | null = null

    crossOrigin = ''

    set src(_value: string) {
        this.onload?.()
    }
}

beforeEach(() => {
    Object.assign(globalThis, { Image: FakeImage })
})

afterEach(() => {
    delete (globalThis as Record<string, unknown>).Image
})

describe('Subscribing to image loads', () => {
    it('Should notify subscribed listeners', () => {
        const listener = jest.fn()

        onImageLoad(listener)
        getImage('chart.png')

        expect(listener)
            .toHaveBeenCalledTimes(1)
    })

    it('Should stop notifying unsubscribed listeners', () => {
        const listener = jest.fn()

        const unsubscribe = onImageLoad(listener)

        unsubscribe()
        getImage('other.png')

        expect(listener)
            .not.toHaveBeenCalled()
    })
})
