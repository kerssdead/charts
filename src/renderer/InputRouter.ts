import Pointer from '@/renderer/Pointer'
import KeyboardFocus from '@/renderer/KeyboardFocus'
import Queue from '@/render/Queue'
import Layout from '@/renderer/Layout'
import ChartPanels from '@/renderer/ChartPanels'
import ChartSettings from '@/types/ChartSettings'
import Point from '@/types/Point'
import RenderItem from '@/types/RenderItem'
import { guard } from '@/helpers/Errors'

type InputScene = {
    queue: Queue
    layout: Layout
    panels: ChartPanels
    getSettings: () => ChartSettings
    openChartMenu: () => boolean
    onChange: () => void
    onError: (error: unknown) => void
}

type KeyHandler = (event: KeyboardEvent) => boolean

export default class InputRouter {
    private readonly pointer: Pointer

    private readonly scene: InputScene

    private readonly keyHandlers: KeyHandler[] = []

    private readonly keyboard: KeyboardFocus

    get position() {
        return this.keyboard.point ?? this.pointer.position
    }

    get focusBounds() {
        return this.keyboard.target?.focusBounds ?? null
    }

    get context() {
        return this.pointer.context
    }

    constructor(canvas: HTMLCanvasElement, scene: InputScene) {
        this.scene = scene

        const { queue, layout, panels } = scene

        this.keyboard = new KeyboardFocus(queue, () => scene.onChange())

        this.pointer = new Pointer(canvas, () => layout.window, {
            onClick: (point: Point) => guard(() => this.onClick(point), scene.onError),
            onChange: () => scene.onChange(),
            onKeyDown: (event: KeyboardEvent) => this.onKeyDown(event),
            onPointerMove: () => this.keyboard.clear(),
            onBlur: () => {
                if (!this.pointer.context)
                    this.keyboard.clear()
            },
            canDrag: (point: Point) => !this.pointer.context && !this.getClickableItemAt(point),
            hasContextMenuAt: (point: Point) => !!scene.getSettings().contextMenu?.length
                                                && queue.items.some(item => item.hasContextMenuAt(point)),
            scrollBy: (point: Point, delta: number) => panels.scrollBy(point, delta),
            getScrollDrag: (point: Point) => panels.getScrollDrag(point)
        })

        this.addKeyHandler(event => this.keyboard.onKeyDown(event))
        this.addKeyHandler(event => this.onMenuKey(event))
    }

    addKeyHandler(handler: KeyHandler) {
        this.keyHandlers.push(handler)
    }

    attach(enableMove: boolean) {
        this.pointer.attach(enableMove)
    }

    detach() {
        this.pointer.detach()
    }

    setScrollable(value: boolean) {
        this.pointer.setScrollable(value)
    }

    openMenu(point: Point) {
        this.pointer.openMenu(point)
    }

    closeContext() {
        this.pointer.closeContext()
    }

    private getClickableItemAt(point: Point): RenderItem | undefined {
        const isContextOpen = this.pointer.context != null

        return this.scene.queue.findTop(item => item.isClickableAt(point, isContextOpen))
    }

    private onKeyDown(event: KeyboardEvent) {
        let isHandled = false

        guard(() => isHandled = this.keyHandlers.some(handler => handler(event)), this.scene.onError)

        return isHandled
    }

    private onMenuKey(event: KeyboardEvent) {
        if (event.key === 'Enter' && !this.keyboard.target)
            return this.scene.openChartMenu()

        const point = this.keyboard.point

        return !!point && InputRouter.isContextMenuKey(event) && this.pointer.openContextMenuAt(point)
    }

    private static isContextMenuKey(event: KeyboardEvent) {
        return event.key === 'ContextMenu' || event.shiftKey && event.key === 'F10'
    }

    private onClick(point: Point) {
        this.getClickableItemAt(point)?.onClick?.()

        this.scene.onChange()
    }
}