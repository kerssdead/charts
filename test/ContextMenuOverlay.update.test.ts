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

describe('Updating context menu overlay', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('Should create a popup with the frame palette', () => {
        const overlay = new ContextMenuOverlay({} as HTMLCanvasElement, jest.fn(), jest.fn())
        const buttons = [{ text: 'Run', action: jest.fn() }]
        const queue = { findTop: jest.fn() } as unknown as Queue
        const frame = {
            queue,
            context: { isMenu: true, point: { x: 10, y: 20 } },
            now: 0,
            theme: DARK_THEME,
            isInstant: true
        } as unknown as Frame

        overlay.fixedButtons = () => buttons
        overlay.update(frame)

        expect(MenuPopup)
            .toHaveBeenCalledWith(expect.anything(), {
                options: buttons,
                theme: DARK_THEME,
                select: expect.any(Function),
                dismiss: expect.any(Function)
            })
    })

    it('Should run the selected action and dismiss the popup', () => {
        const onClose = jest.fn()
        const onAction = jest.fn()
        const overlay = new ContextMenuOverlay({} as HTMLCanvasElement, onClose, onAction)
        const action = jest.fn()
        const buttons = [{ text: 'Run', action }]
        const queue = { findTop: jest.fn() } as unknown as Queue
        const frame = {
            queue,
            context: { isMenu: true, point: { x: 10, y: 20 } },
            now: 0,
            theme: DARK_THEME,
            isInstant: true
        } as unknown as Frame

        overlay.fixedButtons = () => buttons
        overlay.update(frame)

        const config = (MenuPopup as unknown as jest.Mock).mock.calls[0][1] as {
            select: (value: () => void) => void
            dismiss: () => void
        }

        config.select(action)
        config.dismiss()

        expect(onAction)
            .toHaveBeenCalledWith(action)
        expect(onClose)
            .toHaveBeenCalledTimes(2)
    })
})