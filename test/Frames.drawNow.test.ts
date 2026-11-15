import { LIGHT_THEME } from '@/Theme'
import { createFrames, installAnimationFrames, pendingFrameCount, SCREEN, WINDOW } from './FramesTestScene'

beforeEach(installAnimationFrames)

describe('Drawing a frame now', () => {
    it('Should draw immediately', () => {
        const { frames, queue } = createFrames()

        frames.drawNow()

        expect(queue.render)
            .toHaveBeenCalledWith(expect.any(Number), WINDOW, SCREEN, LIGHT_THEME)
    })

    it('Should cancel the pending frame', () => {
        const { frames } = createFrames()

        frames.request()
        frames.drawNow()

        expect(pendingFrameCount())
            .toBe(0)
    })

    it('Should not draw while suspended', () => {
        const { frames, queue } = createFrames()

        frames.suspend()
        frames.drawNow()

        expect(queue.render)
            .not.toHaveBeenCalled()
    })
})