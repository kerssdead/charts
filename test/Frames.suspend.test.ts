import { createFrames, installAnimationFrames, pendingFrameCount, runFrame } from './FramesTestScene'

beforeEach(installAnimationFrames)

describe('Suspending frames', () => {
    it('Should be suspended', () => {
        const { frames } = createFrames()

        frames.suspend()

        expect(frames.isSuspended)
            .toBe(true)
    })

    it('Should cancel the pending frame', () => {
        const { frames } = createFrames()

        frames.request()
        frames.suspend()

        expect(pendingFrameCount())
            .toBe(0)
    })

    it('Should stop requesting frames of a running animation', () => {
        const { frames, queue } = createFrames()

        queue.render.mockImplementation(() => {
            frames.suspend()

            return true
        })

        frames.request()
        runFrame(100)

        expect(pendingFrameCount())
            .toBe(0)
    })
})