import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'

export default abstract class Overlay {
    protected items: Set<RenderItem> = new Set()

    protected show(queue: Queue, items: RenderItem[]) {
        queue.remove(this.items)
        queue.add(items)

        this.items = new Set(items)
    }

    protected remove(queue: Queue) {
        queue.remove(this.items)

        this.items.clear()
    }
}