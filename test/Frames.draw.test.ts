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
            .toHaveBeenCalledWith(100, WINDOW, SCREEN, LIGHT_THEME)
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
            .toHaveBeenLastCalledWith(116, WINDOW, SCREEN, DARK_THEME)
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
})