import { mergeKeyFlags, toggleKey } from '@/helpers/KeySets'

type Identified = {
    id: string
}

export default class ToggleSet<T extends Identified> {
    private keys = new Set<string>()

    has(item: T) {
        return this.keys.has(item.id)
    }

    toggle(item: T) {
        toggleKey(this.keys, item.id)
    }

    clear() {
        this.keys.clear()
    }

    apply(items: T[], getFlag: (item: T) => boolean | undefined) {
        this.keys = mergeKeyFlags(items.map(item => [item.id, getFlag(item)]), this.keys)
    }
}