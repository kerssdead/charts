import Value from '@/types/base/Value'

class Sector extends Value {
    pinned: boolean

    canToggle(): boolean {
        return this.value != 0 || !this.disabled
    }

    reset() {
        super.reset()

        this.pinned = false
    }
}

export default Sector