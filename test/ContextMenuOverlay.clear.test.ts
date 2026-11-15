import ContextMenuOverlay from '@/renderer/ContextMenuOverlay'
import MenuPopup from '@/renderer/MenuPopup'
import Queue from '@/render/Queue'
import Frame from '@/renderer/Frame'
import { DARK_THEME } from './TestTheme'

jest.mock('@/renderer/MenuPopup', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        show: jest.fn(),
        update: jest.fn(),
        remove: jest.fn()
    }))
}))

describe('Clearing context menu overlay', () => {
    it('Should remove the popup and forget its context', () => {
        const overlay = new ContextMenuOverlay({} as HTMLCanvasElement, jest.fn(), jest.fn())
        const queue = { findTop: jest.fn() } as unknown as Queue
        const frame = {
            queue,
            context: { isMenu: true, point: { x: 10, y: 20 } },
            now: 0,
            theme: DARK_THEME,
            isInstant: true
        } as unknown as Frame

        overlay.fixedButtons = () => [{ text: 'Run', action: jest.fn() }]
        overlay.update(frame)

        const popup = (MenuPopup as unknown as jest.Mock).mock.results[0].value as { remove: jest.Mock }

        overlay.clear(queue)

        expect(popup.remove)
            .toHaveBeenCalledTimes(1)
        expect((overlay as unknown as { context: unknown }).context)
            .toBeNull()
    })
})