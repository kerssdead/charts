import Point from '@/types/Point'
import { ZOOM_DEFAULT_STEP } from '@/static/constants/Index'
import { clamp } from '@/helpers/Geometry'

type WheelHandlers = {
    isZoomEnabled: () => boolean
    zoom: (step: number, point: Point) => boolean
    scrollBy: (point: Point, delta: number) => boolean | null
    onChange: () => void
}

const WHEEL_NOTCH = 100

const WHEEL_LINE_HEIGHT = 16

const WHEEL_LATCH = 400

export default class PointerWheel {
    private lastWheel: DOMHighResTimeStamp = -Infinity

    constructor(private readonly handlers: WheelHandlers) {
    }

    handle(event: WheelEvent, point: Point) {
        const delta = event.deltaY * (event.deltaMode === WheelEvent.DOM_DELTA_LINE ? WHEEL_LINE_HEIGHT : 1)

        if (!event.ctrlKey && !event.metaKey) {
            if (delta !== 0)
                this.scroll(event, point, delta)

            return
        }

        if (!this.handlers.isZoomEnabled())
            return

        event.preventDefault()

        const step = clamp(-delta / WHEEL_NOTCH, -1, 1) * ZOOM_DEFAULT_STEP

        if (this.handlers.zoom(step, point))
            this.handlers.onChange()
    }

    private scroll(event: WheelEvent, point: Point, delta: number) {
        const isScrolled = this.handlers.scrollBy(point, delta)
        const isLatched = event.timeStamp - this.lastWheel <= WHEEL_LATCH

        if (isScrolled == null || !isScrolled && !isLatched)
            return

        event.preventDefault()

        this.lastWheel = event.timeStamp

        if (isScrolled)
            this.handlers.onChange()
    }
}