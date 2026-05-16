import RenderStep from 'types/RenderStep'
import { RenderStepType } from 'static/Enums'
import Debug from 'Debug'

export default class Queue {
    queue: RenderStep[]

    ctx: CanvasRenderingContext2D

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
    }

    render() {
        if (!this.isShouldRender())
            return

        this.ctx.beginPath()

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)

        this.ctx.fillStyle = 'blue'
        this.ctx.strokeStyle = 'lightblue'
        this.ctx.lineWidth = 10

        for (const step of this.getSorted()) {
            switch (step.operation) {
                case RenderStepType.Move:
                    this.ctx.moveTo(step.position.x, step.position.y)
                    break

                case RenderStepType.Line:
                    this.ctx.lineTo(step.position.x, step.position.y)
                    this.ctx.stroke()
                    break

                case RenderStepType.QuadraticCurve:
                    this.ctx.quadraticCurveTo(step.args[0], step.args[1], step.position.x, step.position.y)
                    break

                case RenderStepType.ArcTo:
                    this.ctx.arcTo(step.position.x, step.position.y, step.args[0], step.args[1], step.args[2])
                    break

                case RenderStepType.Rect:
                    this.ctx.rect(step.position.x, step.position.y, step.args[0], step.args[1])
                    break

                case RenderStepType.RectFill:
                    this.ctx.fillRect(step.position.x, step.position.y, step.args[0], step.args[1])
                    break

                case RenderStepType.Text:
                    this.ctx.fillText(step.args[0], step.position.x, step.position.y)
                    break

                default:
                    Debug.error(`Step can't be rendered:\n\tOperation:\t${step.operation}\n\tLayer:\t${step.layer}`)
                    break
            }
        }
    }

    private getHash() {
        // todo: not implemented

        return 0
    }

    private isShouldRender() {
        return true

        // todo: muted for test, unmute

        // const nowHash = this.getHash()
        //
        // if (this.hash == nowHash)
        //     return false
        //
        // this.hash = nowHash
        //
        // return true
    }

    private getSorted() {
        return this.queue.sort((a, b) => a.layer - b.layer)
    }

    // private dequeue(step: RenderStep) {
    //     // todo: not implemented
    // }
}