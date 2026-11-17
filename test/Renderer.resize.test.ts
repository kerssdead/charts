import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import {
    createRenderer,
    createSettings,
    mockFrames,
    mockMenu,
    mockPanels,
    mockPanelsQueue
} from './RendererTestData'

describe('Resizing renderer', () => {
    afterEach(() => {
        jest.useRealTimers()
    })

    it('Should only remember the size before settings are applied', () => {
        const { renderer } = createRenderer()

        renderer.resize(600, 300, 2)

        expect(mockMenu().ratio)
            .toBe(2)
        expect(mockFrames().drawNow)
            .not.toHaveBeenCalled()
        expect(mockPanels().build)
            .not.toHaveBeenCalled()
    })

    it('Should build panels on the first resize with an area', () => {
        const { renderer } = createRenderer()

        renderer.apply(createSettings())
        renderer.resize(600, 300, 1)

        expect(mockPanels().build)
            .toHaveBeenCalledWith(expect.objectContaining({ isInitialized: false }))
        expect(mockFrames().drawNow)
            .toHaveBeenCalled()
    })

    it('Should only render when the area is still empty', () => {
        const { renderer } = createRenderer()

        renderer.apply(createSettings())
        renderer.resize(0, 0, 1)

        expect(mockPanels().build)
            .not.toHaveBeenCalled()
        expect(mockFrames().request)
            .toHaveBeenCalled()
    })

    it('Should delay rebuild after the layout was already built', () => {
        jest.useFakeTimers()

        const { renderer } = createRenderer()

        renderer.apply(createSettings())
        renderer.resize(600, 300, 1)

        const build = mockPanels().build

        build.mockClear()
        renderer.resize(500, 300, 1)

        expect(build)
            .not.toHaveBeenCalled()

        jest.advanceTimersByTime(150)

        expect(build)
            .toHaveBeenCalledWith(expect.objectContaining({ isInitialized: true }))
    })

    it('Should restart the delay on repeated resize', () => {
        jest.useFakeTimers()

        const { renderer } = createRenderer()

        renderer.apply(createSettings())
        renderer.resize(600, 300, 1)

        const build = mockPanels().build

        build.mockClear()
        renderer.resize(500, 300, 1)
        jest.advanceTimersByTime(100)
        renderer.resize(400, 300, 1)
        jest.advanceTimersByTime(100)

        expect(build)
            .not.toHaveBeenCalled()

        jest.advanceTimersByTime(50)

        expect(build)
            .toHaveBeenCalledTimes(1)
    })

    it('Should cancel the delayed rebuild when settings are applied', () => {
        jest.useFakeTimers()

        const { renderer } = createRenderer()

        renderer.apply(createSettings())
        renderer.resize(600, 300, 1)
        renderer.resize(500, 300, 1)

        const build = mockPanels().build

        build.mockClear()
        renderer.apply(createSettings())
        build.mockClear()
        jest.advanceTimersByTime(300)

        expect(build)
            .not.toHaveBeenCalled()
    })

    it('Should build animated panels after resize when items are still initializing', () => {
        jest.useFakeTimers()

        const { renderer } = createRenderer()
        const initializing = new RenderItem(new RenderItemRectangle())

        initializing.animation.initDuration = 100
        renderer.apply(createSettings())
        renderer.resize(600, 300, 1)
        mockPanelsQueue().add([initializing])
        mockPanels().build.mockClear()
        renderer.resize(500, 300, 1)
        jest.advanceTimersByTime(150)

        expect(mockPanels().build)
            .toHaveBeenCalledWith(expect.objectContaining({ isInitialized: false }))
    })
})