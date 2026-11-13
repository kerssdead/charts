import Queue from '@/render/Queue'
import Frame from '@/types/Frame'
import PointerContext from '@/types/PointerContext'
import ButtonOptions, { fromDropdownItems } from '@/types/ButtonOptions'
import DropdownItem from '@/types/DropdownItem'
import HoverProgress from '@/types/HoverProgress'
import Overlay from '@/renderer/Overlay'
import MenuPopup from '@/renderer/MenuPopup'
import { ContextMenu } from '@/static/constants/Index'

export default class ContextMenuOverlay extends Overlay {
    menu: DropdownItem[] | undefined

    fixedButtons: (() => ButtonOptions[]) | undefined

    private readonly canvas: HTMLCanvasElement

    private readonly onClose: () => void

    private readonly onAction: (action: () => void) => void

    private context: PointerContext | null = null

    private popup: MenuPopup | null = null

    private fade = new HoverProgress()

    constructor(canvas: HTMLCanvasElement, onClose: () => void, onAction: (action: () => void) => void) {
        super()

        this.canvas = canvas
        this.onClose = onClose
        this.onAction = onAction
    }

    update({ queue, context, now }: Frame): boolean {
        if (context && context !== this.context) {
            this.clear(queue)
            this.context = context

            const buttons = this.findButtons(queue, context)

            if (buttons.length > 0)
                this.popup = new MenuPopup(this.canvas, buttons, action => {
                    this.dismiss()
                    this.onAction(action)
                }, () => this.dismiss())
        }

        const isVisible = context != null && this.popup != null

        this.fade.step(isVisible, now, ContextMenu.fadeDuration)

        if (!isVisible && this.fade.isIdle) {
            this.clear(queue)

            return false
        }

        if (this.popup && this.context) {
            this.popup.show(this.context.point)
            this.popup.update(this.fade.value, isVisible)
        }

        return this.fade.isAnimating
    }

    clear(_queue: Queue) {
        this.popup?.remove()
        this.popup = null
        this.context = null
        this.fade = new HoverProgress()
    }

    private dismiss() {
        this.popup?.remove()
        this.popup = null
        this.onClose()
    }

    private findButtons(queue: Queue, context: PointerContext) {
        if (context.isMenu)
            return this.fixedButtons?.() ?? []

        const target = queue.findTop(item => item.hasContextMenuAt(context.point))

        return target ? fromDropdownItems(this.menu, target.data ?? undefined) : []
    }
}
