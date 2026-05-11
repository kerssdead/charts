import Queue from 'render/Queue'
import Canvas from 'helpers/Canvas'
import RenderStep from 'types/RenderStep'

// todo: "Renderer" is better name for this class
export class DefaultRenderer {
    private queue: Queue

    private readonly canvas: HTMLCanvasElement

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.queue = new Queue(Canvas.getContext(this.canvas))
    }

    render():void {
        this.queue.queue = this.getSteps()
        this.queue.render()
    }

    private getSteps():RenderStep[] {
        return []
    }
}