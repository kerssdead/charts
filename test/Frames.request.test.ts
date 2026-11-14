import HoverProgress from '@/types/HoverProgress'
import { createFrames, installAnimationFrames, pendingFrameCount, POSITION, RESERVED, runFrame, SCREEN, WINDOW } from './FramesTestScene'

jest.mock('@/Theme', () => ({ __esModule: true, default: { update: jest.fn() } }))

beforeEach(installAnimationFrames)

describe('Requesting a frame', () => {
    it('Should draw the scene on the next animation frame', () => {
        const { frames, queue, panels } = createFrames()

        frames.request()
        runFrame(100)

        expect(queue.animate)
            .toHaveBeenCalledWith(POSITION, 100)
        expect(panels.animate)
            .toHaveBeenCalledWith(100, WINDOW)
        expect(queue.render)
            .toHaveBeenCalledWith(100, WINDOW, SCREEN)
    })

    it('Should request only one frame at a time', () => {
        const { frames } = createFrames()

        frames.request()
        frames.request()

        expect(pendingFrameCount())
            .toBe(1)
    })

    it('Should not request a frame while suspended', () => {
        const { frames } = createFrames()

        frames.suspend()
        frames.request()

        expect(pendingFrameCount())
            .toBe(0)
    })

    it('Should keep requesting frames while the scene is animating', () => {
        const { frames, queue } = createFrames()

        queue.render.mockReturnValueOnce(true)

        frames.request()
        runFrame(100)

        expect(pendingFrameCount())
            .toBe(1)

        runFrame(116)

        expect(pendingFrameCount())
            .toBe(0)
    })

    it('Should update overlays with the current frame', () => {
        const { frames, queue, overlay } = createFrames()

        frames.request()
        runFrame(100)

        expect(overlay.update)
            .toHaveBeenCalledWith({
                queue,
                window: WINDOW,
                screen: SCREEN,
                mouse: POSITION,
                context: null,
                now: 100
            })
    })

    it('Should fit the layout to a moving legend', () => {
        const { frames, layout, legend } = createFrames()

        legend.isMoving = true

        frames.request()
        runFrame(100)

        expect(layout.fit)
            .toHaveBeenCalledWith(RESERVED)
    })

    it('Should follow static mode for hover', () => {
        const { frames } = createFrames({ staticMode: true })

        frames.request()
        runFrame(100)

        expect(HoverProgress.isInstant)
            .toBe(true)
    })

    it('Should report a failed draw', () => {
        const error = new Error('Broken')
        const { frames, queue, onError } = createFrames()

        queue.render.mockImplementation(() => { throw error })

        frames.request()
        runFrame(100)

        expect(onError)
            .toHaveBeenCalledWith(error)
    })
})