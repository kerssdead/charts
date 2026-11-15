import { createFrames, installAnimationFrames, pendingFrameCount } from './FramesTestScene'

beforeEach(installAnimationFrames)

describe('Resuming frames', () => {
    it('Should not be suspended', () => {
        const { frames } = createFrames()

        frames.suspend()
        frames.resume()

        expect(frames.isSuspended)
            .toBe(false)
    })

    it('Should request a frame', () => {
        const { frames } = createFrames()

        frames.suspend()
        frames.resume()

        expect(pendingFrameCount())
            .toBe(1)
    })

    it('Should allow drawing now again', () => {
        const { frames, queue } = createFrames()

        frames.suspend()
        frames.resume()
        frames.drawNow()

        expect(queue.render)
            .toHaveBeenCalledTimes(1)
    })
})