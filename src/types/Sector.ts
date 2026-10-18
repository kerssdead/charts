import Value from '@/types/base/Value'

class Sector extends Value {
    canToggle(): boolean {
        return this.value != 0 || !this.disabled
    }
}

export default Sector