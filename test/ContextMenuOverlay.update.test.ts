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

const frame = (queue: Queue, context: unknown, isInstant: boolean = true) => {
    return { queue, context, now: 0, theme: DARK_THEME, isInstant } as unknown as Frame
}

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
            context: { isOpenedFromButton: true, point: { x: 10, y: 20 } },
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
            context: { isOpenedFromButton: true, point: { x: 10, y: 20 } },
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

    it('Should build buttons from the menu of the item under the context point', () => {
        const overlay = new ContextMenuOverlay({} as HTMLCanvasElement, jest.fn(), jest.fn())
        const dataAt = jest.fn(() => ({ id: 1 }))
        const target = { dataAt }
        const queue = {
            findTop: jest.fn((predicate: (item: unknown) => boolean) => {
                predicate({ hasContextMenuAt: () => true })

                return target
            })
        } as unknown as Queue
        const action = jest.fn()

        overlay.menu = [{ text: 'Open', action }]
        overlay.update({
            queue,
            context: { isOpenedFromButton: false, point: { x: 1, y: 2 } },
            now: 0,
            theme: DARK_THEME,
            isInstant: true
        } as unknown as Frame)

        const options = (MenuPopup as unknown as jest.Mock).mock.calls[0][1].options

        options[0].action()

        expect(options.map((option: { text: string }) => option.text))
            .toEqual(['Open'])
        expect(action)
            .toHaveBeenCalledWith({ id: 1 })
        expect(dataAt)
            .toHaveBeenCalledWith({ x: 1, y: 2 })
    })

    it('Should not open a popup when nothing has a context menu at the point', () => {
        const overlay = new ContextMenuOverlay({} as HTMLCanvasElement, jest.fn(), jest.fn())
        const queue = { findTop: jest.fn() } as unknown as Queue

        overlay.menu = [{ text: 'Open', action: jest.fn() }]

        expect(overlay.update(frame(queue, { isOpenedFromButton: false, point: { x: 1, y: 2 } })))
            .toBe(false)
        expect(MenuPopup)
            .not.toHaveBeenCalled()
    })

    it('Should not open a popup when the fixed buttons are not set', () => {
        const overlay = new ContextMenuOverlay({} as HTMLCanvasElement, jest.fn(), jest.fn())
        const queue = { findTop: jest.fn() } as unknown as Queue

        overlay.update(frame(queue, { isOpenedFromButton: true, point: { x: 1, y: 2 } }))

        expect(MenuPopup)
            .not.toHaveBeenCalled()
    })

    it('Should show the popup at the context point and keep one popup for the same context', () => {
        const overlay = new ContextMenuOverlay({} as HTMLCanvasElement, jest.fn(), jest.fn())
        const queue = { findTop: jest.fn() } as unknown as Queue
        const context = { isOpenedFromButton: true, point: { x: 10, y: 20 } }

        overlay.fixedButtons = () => [{ text: 'Run', action: jest.fn() }]
        overlay.update(frame(queue, context))
        overlay.update(frame(queue, context))

        const popup = (MenuPopup as unknown as jest.Mock).mock.results[0].value

        expect(MenuPopup)
            .toHaveBeenCalledTimes(1)
        expect(popup.show)
            .toHaveBeenCalledWith({ x: 10, y: 20 })
        expect(popup.update)
            .toHaveBeenCalledWith(expect.any(Number), true)
    })

    it('Should remove the popup after the context is closed and the fade is finished', () => {
        const overlay = new ContextMenuOverlay({} as HTMLCanvasElement, jest.fn(), jest.fn())
        const queue = { findTop: jest.fn() } as unknown as Queue

        overlay.fixedButtons = () => [{ text: 'Run', action: jest.fn() }]
        overlay.update(frame(queue, { isOpenedFromButton: true, point: { x: 10, y: 20 } }))

        const popup = (MenuPopup as unknown as jest.Mock).mock.results[0].value

        expect(overlay.update(frame(queue, null)))
            .toBe(false)
        expect(popup.remove)
            .toHaveBeenCalled()
    })

    it('Should report animation while the popup fades in', () => {
        const overlay = new ContextMenuOverlay({} as HTMLCanvasElement, jest.fn(), jest.fn())
        const queue = { findTop: jest.fn() } as unknown as Queue

        overlay.fixedButtons = () => [{ text: 'Run', action: jest.fn() }]

        expect(overlay.update(frame(queue, { isOpenedFromButton: true, point: { x: 1, y: 2 } }, false)))
            .toBe(true)
    })

    it('Should pass no data to menu actions of items without data', () => {
        const overlay = new ContextMenuOverlay({} as HTMLCanvasElement, jest.fn(), jest.fn())
        const queue = { findTop: jest.fn(() => ({ dataAt: () => null })) } as unknown as Queue
        const action = jest.fn()

        overlay.menu = [{ text: 'Open', action }]
        overlay.update(frame(queue, { isOpenedFromButton: false, point: { x: 1, y: 2 } }))
        ;(MenuPopup as unknown as jest.Mock).mock.calls[0][1].options[0].action()

        expect(action)
            .toHaveBeenCalledWith(undefined)
    })
})