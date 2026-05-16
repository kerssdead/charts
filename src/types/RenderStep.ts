import { RenderStepType } from 'static/Enums'
import Point from './Point'

export default class RenderStep {
    layer: number

    args: any[]

    color: string

    operation: RenderStepType

    position: Point

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