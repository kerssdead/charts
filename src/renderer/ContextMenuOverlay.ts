import Queue from '@/render/Queue'
import Frame from '@/renderer/Frame'
import PointerContext from '@/types/PointerContext'
import ButtonOptions, { fromDropdownItems } from '@/types/ButtonOptions'
import DropdownItem from '@/types/DropdownItem'
import HoverProgress from '@/types/HoverProgress'
import Overlay from '@/renderer/Overlay'
import MenuPopup from '@/renderer/MenuPopup'
import { ContextMenu } from '@/static/constants/Index'

export default class ContextMenuOverlay extends Overlay {
    menu?: DropdownItem[]

    fixedButtons?: () => ButtonOptions[]

    private context: PointerContext | null = null

    private popup: MenuPopup | null = null

    private fade = new HoverProgress()

    constructor(
        private readonly canvas: HTMLCanvasElement,
        private readonly onClose: () => void,
        private readonly onAction: (action: () => void) => void
    ) {
        super()
    }

    update({ queue, context, now, theme, isInstant }: Frame) {
        if (context && context !== this.context) {
            this.clear(queue)
            this.context = context

            const buttons = this.findButtons(queue, context)

            if (buttons.length > 0)
                this.popup = new MenuPopup(this.canvas, {
                    options: buttons,
                    theme,
                    select: action => {
                        this.dismiss()
                        this.onAction(action)
                    },
                    dismiss: () => this.dismiss()
                })
        }

        const isVisible = context != null && this.popup != null

        this.fade.step(isVisible, now, ContextMenu.fadeDuration, isInstant)

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
        if (context.isOpenedFromButton)
            return this.fixedButtons?.() ?? []

        const target = queue.findTop(item => item.hasContextMenuAt(context.point))

        return target ? fromDropdownItems(this.menu, target.dataAt(context.point) ?? undefined) : []
    }
}