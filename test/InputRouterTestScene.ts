import InputRouter from '@/renderer/InputRouter'
import Pointer from '@/renderer/Pointer'
import ChartSettings from '@/types/ChartSettings'
import Point from '@/types/Point'

export const WINDOW = { name: 'window' }

export type PointerHandlers = ConstructorParameters<typeof Pointer>[2]

export type FakeItem = {
    onClick?: () => void
    isClickableAt: jest.Mock
    hasContextMenuAt: jest.Mock
}

export function item(isOver: boolean, onClick?: () => void): FakeItem {
    return {
        onClick,
        isClickableAt: jest.fn((_point: Point, isContextOpen: boolean) => isOver && !!onClick && !isContextOpen),
        hasContextMenuAt: jest.fn(() => isOver)
    }
}

export function createRouter(items: FakeItem[] = [], settings: Partial<ChartSettings> = {}) {
    const pointer = {
        position: { x: 1, y: 2 } as Point | null,
        context: null as object | null,
        attach: jest.fn(),
        detach: jest.fn(),
        setScrollable: jest.fn(),
        openMenu: jest.fn(),
        closeContext: jest.fn(),
        openContextMenuAt: jest.fn((_point: Point) => true)
    }

    let handlers!: PointerHandlers
    let getWindow!: () => unknown

    jest.mocked(Pointer).mockImplementation((_canvas, window, pointerHandlers) => {
        getWindow = window
        handlers = pointerHandlers

        return pointer as unknown as Pointer
    })

    const queue = {
        items,
        version: 1,
        findTop: (predicate: (item: FakeItem) => boolean) => [...items].reverse().find(predicate)
    }
    const panels = { scrollBy: jest.fn(() => true), getScrollDrag: jest.fn(() => null) }
    const openChartMenu = jest.fn(() => false)
    const onChange = jest.fn()
    const onError = jest.fn()

    const router = new InputRouter({} as HTMLCanvasElement, {
        queue,
        layout: { window: WINDOW },
        panels,
        getSettings: () => settings as ChartSettings,
        openChartMenu,
        onChange,
        onError
    } as unknown as ConstructorParameters<typeof InputRouter>[1])

    return { router, pointer, handlers, getWindow, panels, onChange, onError, openChartMenu }
}