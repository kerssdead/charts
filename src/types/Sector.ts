import Value from '@/types/base/Value'

class Sector extends Value {
    checkCondition(): boolean {
        return this.value != 0 || !this.disabled
    }
}

export default Sector