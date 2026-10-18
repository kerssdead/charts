import Value from '@/types/base/Value'

class Sector extends Value {
    constructor(obj: object) {
        super()

        Object.assign(this, obj)
    }

    checkCondition(): boolean {
        return this.value != 0 || !this.disabled
    }
}

export default Sector