import { LIGHT_THEME } from '@/Theme'
import {
    createFrames,
    installAnimationFrames,
    runFrame,
    SCREEN,
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
})