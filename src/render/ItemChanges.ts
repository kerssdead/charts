import RenderItem from '@/types/RenderItem'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import Span from '@/types/Span'
import { ItemFlag as f } from '@/static/ItemFlag'

type ShapeChanges = Map<RenderItemBase, boolean>

export default class ItemChanges {
    private current = new Set<RenderItem>()

    private previous = new Set<RenderItem>()

    beginStep() {
        const previous = this.previous

        this.previous = this.current
        this.current = previous
        this.current.clear()
    }

    add(item: RenderItem) {
        this.current.add(item)
    }

    clear() {
        this.current.clear()
        this.previous.clear()
    }

    findChangedSpan(items: readonly RenderItem[]): Span | null {
        const ownChanges: ShapeChanges = new Map()

        for (const item of items)
            ownChanges.set(item.shape, this.isChangedItself(item))

        const changes: ShapeChanges = new Map()

        let start = -1
        let end = -1

        for (let i = 0; i < items.length; i++) {
            if (!isChanged(items[i].shape, ownChanges, changes))
                continue

            if (start < 0)
                start = i

            end = i
        }

        return start < 0 ? null : { start, end }
    }

    private isChangedItself(item: RenderItem) {
        return this.current.has(item)
               || this.previous.has(item)
               || item.isInitializing
               || item.animation.isMorphing
               || item.is(f.Removable)
               || !item.shape.canBeCached()
    }
}

function isChanged(shape: RenderItemBase, ownChanges: ShapeChanges, changes: ShapeChanges): boolean {
    const known = changes.get(shape)

    if (known !== undefined)
        return known

    changes.set(shape, true)

    const isShapeChanged = (ownChanges.get(shape) ?? true)
                           || shape.getDependencies().some(dependency => isChanged(dependency, ownChanges, changes))

    changes.set(shape, isShapeChanged)

    return isShapeChanged
}