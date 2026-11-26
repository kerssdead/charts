import Value from '@/types/base/Value'

class Sector extends Value {
    pinned?: boolean

    get isBlank() {
        return this.value === 0
    }

    canToggle() {
        return !this.isBlank
    }
}

export default Sector