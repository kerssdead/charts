import Theme from '@/Theme'
import { Events } from '@/static/Enums'

describe('Detaching theme', () => {
    let media: { matches: boolean, addEventListener: jest.Mock, removeEventListener: jest.Mock }

    beforeEach(() => {
        media = { matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn() }

        Object.assign(globalThis, { window: { matchMedia: () => media } })
    })

    afterEach(() => {
        delete (globalThis as Record<string, unknown>).window
    })

    it('Should remove the media listener', () => {
        const theme = new Theme()

        theme.initialize(jest.fn())

        const listener = media.addEventListener.mock.calls[0][1] as () => void

        theme.detach()

        expect(media.removeEventListener)
            .toHaveBeenCalledWith(Events.Change, listener)
    })

    it('Should ignore repeated detach', () => {
        const theme = new Theme()

        theme.initialize(jest.fn())
        theme.detach()
        theme.detach()

        expect(media.removeEventListener)
            .toHaveBeenCalledTimes(1)
    })
})