import { createFrames, installAnimationFrames, pendingFrameCount, runFrame } from './FramesTestScene'

beforeEach(installAnimationFrames)

describe('Cancelling a frame', () => {
    it('Should cancel the pending frame', () => {
        const { frames, queue } = createFrames()

        frames.request()
        frames.cancel()
        runFrame(100)

        expect(queue.render)
            .not.toHaveBeenCalled()
    })

    it('Should allow requesting a frame again', () => {
        const { frames } = createFrames()

        frames.request()
        frames.cancel()
        frames.request()

        expect(pendingFrameCount())
            .toBe(1)
    })
})