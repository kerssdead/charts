import Value from '@/types/base/Value'

class Sector extends Value {
    pinned: boolean

    get isBlank() {
        return this.value === 0
    }

    canToggle(): boolean {
        return !this.isBlank
    }

    reset() {
        super.reset()

        this.pinned = false
    }
}

export default Sector