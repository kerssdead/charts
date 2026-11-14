import { createFrames, installAnimationFrames, pendingFrameCount, SCREEN, WINDOW } from './FramesTestScene'

jest.mock('@/Theme', () => ({ __esModule: true, default: { update: jest.fn() } }))

beforeEach(installAnimationFrames)

describe('Drawing a frame now', () => {
    it('Should draw immediately', () => {
        const { frames, queue } = createFrames()

        frames.drawNow()

        expect(queue.render)
            .toHaveBeenCalledWith(expect.any(Number), WINDOW, SCREEN)
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