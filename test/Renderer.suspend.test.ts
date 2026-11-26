import { createRenderer, createSettings, mockContextMenu, mockFrames, mockPointer, mockTooltip } from './RendererTestData'
import { onImageLoad } from '@/helpers/Images'

describe('Suspending renderer', () => {
    it('Should detach inputs and clear transient overlays', () => {
        const { renderer } = createRenderer()

        renderer.apply(createSettings())
        renderer.suspend()

        expect(mockPointer().detach)
            .toHaveBeenCalled()
        expect(mockTooltip().clear)
            .toHaveBeenCalled()
        expect(mockContextMenu().clear)
            .toHaveBeenCalled()
        expect(mockFrames().suspend)
            .toHaveBeenCalled()
    })

    it('Should stop listening to image loads', () => {
        const removeImageListener = jest.fn()

        jest.mocked(onImageLoad).mockReturnValueOnce(removeImageListener)

        const { renderer } = createRenderer()

        renderer.apply(createSettings())
        renderer.suspend()

        expect(removeImageListener)
            .toHaveBeenCalledTimes(1)
    })
})