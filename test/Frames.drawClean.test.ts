import { createFrames, installAnimationFrames, pendingFrameCount, POSITION, runFrame } from './FramesTestScene'

beforeEach(installAnimationFrames)

describe('Drawing a clean frame', () => {
    it('Should draw without the pointer and with instant hover', () => {
        const { frames, queue, overlay } = createFrames()

        frames.drawClean()

        expect(queue.animate)
            .toHaveBeenCalledWith(null, expect.any(Number), true)
        expect(overlay.update)
            .toHaveBeenCalledWith(expect.objectContaining({ mouse: null, isInstant: true }))
    })

    it('Should draw with the pointer again on the next frame', () => {
        const { frames, queue } = createFrames()

        frames.drawClean()
        runFrame(100)

        expect(queue.animate)
            .toHaveBeenLastCalledWith(POSITION, 100, false)
    })

    it('Should replace the pending frame with a new one', () => {
        const { frames } = createFrames()

        frames.request()
        frames.drawClean()

        expect(pendingFrameCount())
            .toBe(1)
        expect(cancelAnimationFrame)
            .toHaveBeenCalledTimes(1)
    })
})