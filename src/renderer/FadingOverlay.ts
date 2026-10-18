import Queue from '@/render/Queue'
import Overlay from '@/renderer/Overlay'
import HoverProgress from '@/types/HoverProgress'

export default abstract class FadingOverlay<State, Built> extends Overlay {
    protected state: State | null = null

    protected built: Built | null = null

    protected fade = new HoverProgress()

    clear(queue: Queue) {
        this.remove(queue)

        this.state = null
        this.fade = new HoverProgress()
    }

    protected remove(queue: Queue) {
        super.remove(queue)

        this.built = null
    }

    protected setAlpha(alpha: number) {
        for (const item of this.items)
            item.animation.alpha = alpha
    }
}