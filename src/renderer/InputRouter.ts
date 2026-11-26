import Pointer from '@/renderer/Pointer'
import KeyboardFocus from '@/renderer/KeyboardFocus'
import Scene from '@/renderer/Scene'
import Point from '@/types/Point'
import RenderItem from '@/types/RenderItem'
import { guard } from '@/helpers/Errors'
import { Keys } from '@/static/Enums'

type InputCallbacks = {
    openChartMenu: () => boolean
    onChange: () => void
    onError: (error: unknown) => void
}

type KeyHandler = (event: KeyboardEvent) => boolean

export default class InputRouter {
    readonly pointer: Pointer

    private readonly keyHandlers: KeyHandler[] = []

    private readonly keyboard: KeyboardFocus

    get position() {
        return this.keyboard.point ?? this.pointer.position
    }

    get focusBounds() {
        return this.keyboard.target?.focusBounds ?? null
    }

    constructor(
        canvas: HTMLCanvasElement,
        private readonly scene: Scene,
        private readonly callbacks: InputCallbacks
    ) {
        const { queue, layout, panels } = scene

        this.keyboard = new KeyboardFocus(queue, () => callbacks.onChange())

        this.pointer = new Pointer(canvas, () => layout.window, {
            onClick: (point: Point) => guard(() => this.onClick(point), callbacks.onError),
            onChange: () => callbacks.onChange(),
            onKeyDown: (event: KeyboardEvent) => this.onKeyDown(event),
            onPointerMove: () => this.keyboard.clear(),
            onBlur: () => {
                if (!this.pointer.context)
                    this.keyboard.clear()
            },
            canDrag: (point: Point) => !this.pointer.context && !this.getClickableItemAt(point),
            hasContextMenuAt: (point: Point) => !!scene.settings.contextMenu?.length
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

    private getClickableItemAt(point: Point): RenderItem | undefined {
        const isContextOpen = this.pointer.context != null

        return this.scene.queue.findTop(item => item.isClickableAt(point, isContextOpen))
    }

    private onKeyDown(event: KeyboardEvent) {
        let isHandled = false

        guard(() => isHandled = this.keyHandlers.some(handler => handler(event)), this.callbacks.onError)

        return isHandled
    }

    private onMenuKey(event: KeyboardEvent) {
        if (event.key === Keys.Enter && !this.keyboard.target)
            return this.callbacks.openChartMenu()

        const point = this.keyboard.point

        return !!point && InputRouter.isContextMenuKey(event) && this.pointer.openContextMenuAt(point)
    }

    private static isContextMenuKey(event: KeyboardEvent) {
        return event.key === Keys.ContextMenu || event.shiftKey && event.key === Keys.F10
    }

    private onClick(point: Point) {
        this.getClickableItemAt(point)?.onClick?.()

        this.callbacks.onChange()
    }
}