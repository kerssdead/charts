import { LIGHT_THEME } from '@/Theme'
import { DARK_THEME } from './TestTheme'
import {
    createFrames,
    installAnimationFrames,
    runFrame,
    SCREEN,
    theme,
    WINDOW
} from './FramesTestScene'

beforeEach(installAnimationFrames)

describe('Drawing frames', () => {
    it('Should rebuild the scene when the palette changes', () => {
        const { frames, syncTheme, rebuildForTheme } = createFrames()

        syncTheme.mockReturnValue(true)
        frames.request()
        runFrame(100)

        expect(rebuildForTheme)
            .toHaveBeenCalledTimes(1)
    })

    it('Should keep the scene when the palette is unchanged', () => {
        const { frames, rebuildForTheme, queue } = createFrames()

        frames.request()
        runFrame(100)

        expect(rebuildForTheme)
            .not.toHaveBeenCalled()
        expect(queue.render)
            .toHaveBeenCalledWith(100, WINDOW, SCREEN, LIGHT_THEME, false)
    })

    it('Should skip rendering when nothing changed since the previous frame', () => {
        const { frames, queue } = createFrames()

        frames.request()
        runFrame(100)

        frames.request()
        runFrame(116)

        expect(queue.render)
            .toHaveBeenCalledTimes(1)
    })

    it('Should render when the queue changes', () => {
        const { frames, queue } = createFrames()

        frames.request()
        runFrame(100)

        queue.version = 1
        frames.request()
        runFrame(116)

        expect(queue.render)
            .toHaveBeenCalledTimes(2)
    })

    it('Should render while an animation is in progress', () => {
        const { frames, queue } = createFrames()

        queue.animate.mockReturnValue(true)
        frames.request()
        runFrame(100)

        queue.animate.mockReturnValue(false)
        frames.request()
        runFrame(116)

        expect(queue.render)
            .toHaveBeenCalledTimes(2)
    })

    it('Should render one more frame after an animation ends', () => {
        const { frames, queue } = createFrames()

        queue.animate.mockReturnValueOnce(true)
        frames.request()
        runFrame(100)
        runFrame(116)

        expect(queue.render)
            .toHaveBeenCalledTimes(2)

        frames.request()
        runFrame(132)

        expect(queue.render)
            .toHaveBeenCalledTimes(2)
    })

    it('Should render when the theme changes', () => {
        const { frames, queue } = createFrames()

        frames.request()
        runFrame(100)

        theme.current = DARK_THEME
        frames.request()
        runFrame(116)

        expect(queue.render)
            .toHaveBeenLastCalledWith(116, WINDOW, SCREEN, DARK_THEME, false)
    })

    it('Should render when the window moves or resizes', () => {
        const { frames, queue, layout } = createFrames()

        Object.assign(layout, { window: { x: 0, y: 0, width: 10, height: 10 } })
        frames.request()
        runFrame(100)

        Object.assign(layout, { window: { x: 0, y: 0, width: 20, height: 10 } })
        frames.request()
        runFrame(116)

        expect(queue.render)
            .toHaveBeenCalledTimes(2)
    })

    it('Should skip rendering when the window is replaced by an equal one', () => {
        const { frames, queue, layout } = createFrames()

        Object.assign(layout, { window: { x: 0, y: 0, width: 10, height: 10 } })
        frames.request()
        runFrame(100)

        Object.assign(layout, { window: { x: 0, y: 0, width: 10, height: 10 } })
        frames.request()
        runFrame(116)

        expect(queue.render)
            .toHaveBeenCalledTimes(1)
    })

    it('Should render when a panel body changes', () => {
        const { frames, queue, panels } = createFrames()
        const panel = { window: { x: 0, y: 0, width: 5, height: 5 }, body: { x: 0, y: 0, width: 5, height: 5 } }

        Object.assign(panels, { list: [panel] })
        frames.request()
        runFrame(100)

        panel.body = { x: 0, y: 3, width: 5, height: 5 }
        frames.request()
        runFrame(116)

        expect(queue.render)
            .toHaveBeenCalledTimes(2)
    })

    it('Should render when a panel is added', () => {
        const { frames, queue, panels } = createFrames()
        const rect = { x: 0, y: 0, width: 5, height: 5 }

        frames.request()
        runFrame(100)

        Object.assign(panels, { list: [{ window: rect, body: rect }] })
        frames.request()
        runFrame(116)

        expect(queue.render)
            .toHaveBeenCalledTimes(2)
    })

    describe('Settling after animation', () => {
        beforeEach(() => jest.useFakeTimers())

        afterEach(() => jest.useRealTimers())

        const animateOnce = () => {
            const scene = createFrames()

            scene.queue.render.mockReturnValueOnce(true)
            scene.frames.request()
            runFrame(100)
            runFrame(116)

            return scene
        }

        it('Should renew canvas buffers, redraw and release layers two seconds after animation ends', () => {
            const { queue, renewCanvas, releaseLayers } = animateOnce()
            const calls: string[] = []

            renewCanvas.mockImplementation(() => calls.push('renew'))
            releaseLayers.mockImplementation(() => calls.push('release'))
            queue.render.mockImplementation(() => {
                calls.push('render')

                return false
            })
            jest.advanceTimersByTime(2000)

            expect(calls)
                .toEqual(['renew', 'render', 'release'])
        })

        it('Should wait two full seconds before renewing', () => {
            const { renewCanvas } = animateOnce()

            jest.advanceTimersByTime(1999)

            expect(renewCanvas)
                .not.toHaveBeenCalled()
        })

        it('Should not renew canvas buffers while animating', () => {
            const { frames, queue, renewCanvas } = createFrames()

            queue.render.mockReturnValue(true)
            frames.request()
            runFrame(100)
            runFrame(116)
            jest.advanceTimersByTime(2000)

            expect(renewCanvas)
                .not.toHaveBeenCalled()
        })

        it('Should not renew canvas buffers without a previous animation', () => {
            const { frames, renewCanvas } = createFrames()

            frames.request()
            runFrame(100)
            jest.advanceTimersByTime(2000)

            expect(renewCanvas)
                .not.toHaveBeenCalled()
        })

        it('Should not renew canvas buffers after suspending', () => {
            const { frames, renewCanvas } = animateOnce()

            frames.suspend()
            jest.advanceTimersByTime(2000)

            expect(renewCanvas)
                .not.toHaveBeenCalled()
        })

        it('Should report a failed renewal', () => {
            const { renewCanvas, onError } = animateOnce()
            const error = new Error('renew')

            renewCanvas.mockImplementation(() => {
                throw error
            })
            jest.advanceTimersByTime(2000)

            expect(onError)
                .toHaveBeenCalledWith(error)
        })
    })
})