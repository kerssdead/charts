import Value from 'types/base/Value'

class PlotPoint extends Value {
    x: number | Date | string

    y: number | Date | string

    constructor(obj: object) {
        super()

        Object.assign(this, obj)
    }

    // ~! better name ?
    inverse() {
        const x = this.x
        this.x = this.y as any
        this.y = x as any
    }
}

export default PlotPoint