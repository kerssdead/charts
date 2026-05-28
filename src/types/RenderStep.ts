import { RenderStepType } from 'static/Enums'
import Point from './Point'

// todo: remove
export default class RenderStep {
    layer: number

    args: any[]

    color: string

    operation: RenderStepType

    position: Point

    // todo: item { items:[], direction?, margin?, action, style, gap }
    // todo: use fluent syntax

    static Move(x: number, y: number): RenderStep {
        return {
            layer: 0,
            args: [],
            color: '',
            operation: RenderStepType.Move,
            position: { x: x, y: y }
        }
    }

    static Line(x: number, y: number): RenderStep {
        return {
            layer: 0,
            args: [],
            color: 'blue',
            operation: RenderStepType.Line,
            position: { x: x, y: y }
        }
    }
}