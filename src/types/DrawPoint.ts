import { DrawPointType } from 'static/Enums'

export class DrawPoint {
    /**
     * Method invocation arguments, where even indexed is x-axis points and odd is y-axis points
     */
    args: any[]

    type: DrawPointType

    readonly base: any[]

    constructor(type: DrawPointType, ...args: any[]) {
        this.args = args
        this.type = type
        this.base = JSON.parse(JSON.stringify(args))
    }
}