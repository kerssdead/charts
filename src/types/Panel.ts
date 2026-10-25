import CanvasWindow from '@/types/CanvasWindow'
import Point from '@/types/Point'
import type PlotProcess from '@/render/plot/PlotProcess'
import type { ScrollDrag } from '@/renderer/Pointer'
import RectangleDimensions from '@/types/RectangleDimensions'
import { clamp, contains } from '@/helpers/Geometry'

const GAP = 16

const THUMB_WIDTH = 4

const THUMB_INSET = 2

const THUMB_MIN_HEIGHT = 24

const THUMB_HIT_WIDTH = 12

const SCROLL_SMOOTHING = 80

const SCROLL_FRAME = 16

const SCROLL_PRECISION = .5

export type PanelScroll = {
    top: number

    height: number
}

export default class Panel {
    readonly index: number

    readonly rect: RectangleDimensions

    readonly window: CanvasWindow = new CanvasWindow(0, 0)

    readonly body: CanvasWindow = new CanvasWindow(0, 0)

    plot: PlotProcess | null = null

    scroll: PanelScroll | null = null

    offset: number = 0

    target: number = 0

    clip: RectangleDimensions = { x: 0, y: 0, width: 0, height: 0 }

    zoom: number = 1

    private baseHeight: number = 0

    private scrollTime: DOMHighResTimeStamp | null = null

    constructor(index: number, rect: RectangleDimensions) {
        this.index = index
        this.rect = rect
    }

    get maxOffset() {
        return this.scroll ? Math.max(this.scroll.height - this.baseHeight, 0) : 0
    }

    get canScroll() {
        return this.maxOffset > 0
    }

    get thumb(): RectangleDimensions | null {
        if (!this.scroll || !this.canScroll)
            return null

        const track = this.clip
        const { top, height: content } = this.scroll

        const height = clamp(track.height * (this.baseHeight - top) / (content - top), THUMB_MIN_HEIGHT, track.height)

        return {
            x: track.x + track.width - THUMB_WIDTH - THUMB_INSET,
            y: track.y + (track.height - height) * this.offset / this.maxOffset,
            width: THUMB_WIDTH,
            height
        }
    }

    update(window: CanvasWindow) {
        this.window.x = window.x + window.width * this.rect.x
        this.window.y = window.y + window.height * this.rect.y
        this.window.width = window.width * this.rect.width
        this.window.height = window.height * this.rect.height

        this.baseHeight = window.baseHeight * this.rect.height
        this.zoom = window.baseHeight > 0 ? window.height / window.baseHeight : 1
        this.offset = this.clampOffset(this.offset)
        this.target = this.clampOffset(this.target)

        const top = (this.scroll?.top ?? 0) * this.zoom

        this.body.x = this.window.x
        this.body.y = this.window.y - this.offset * this.zoom
        this.body.width = this.window.width
        this.body.height = this.window.height

        this.clip = {
            x: this.window.x,
            y: this.window.y + top,
            width: this.window.width,
            height: Math.max(this.window.height - top, 0)
        }
    }

    keepScroll(previous: Panel | undefined) {
        this.offset = previous?.offset ?? 0
        this.target = previous?.target ?? 0
    }

    scrollTo(offset: number): boolean {
        const next = this.clampOffset(offset)
        const isChanged = next != this.offset

        this.offset = this.target = next

        return isChanged
    }

    glideTo(target: number): boolean {
        const next = this.clampOffset(target)
        const isChanged = next != this.target

        this.target = next

        return isChanged
    }

    glideBy(delta: number): boolean {
        return this.glideTo(this.target + delta / this.zoom)
    }

    getDrag(point: Point): ScrollDrag | null {
        const start = this.offset

        if (this.isOnScrollbar(point)) {
            const ratio = this.thumbRatio()

            return dy => this.scrollTo(start + dy * ratio)
        }

        return contains(this.clip, point)
               ? dy => this.scrollTo(start - dy / this.zoom)
               : null
    }

    animateScroll(now: DOMHighResTimeStamp): boolean {
        if (this.offset == this.target) {
            this.scrollTime = null

            return false
        }

        const elapsed = now - (this.scrollTime ?? now - SCROLL_FRAME)

        this.scrollTime = now
        this.offset += (this.target - this.offset) * (1 - Math.exp(-elapsed / SCROLL_SMOOTHING))

        if (Math.abs(this.target - this.offset) < SCROLL_PRECISION)
            this.offset = this.target

        return true
    }

    isOnScrollbar(point: Point) {
        const { x, y, width, height } = this.clip

        return this.canScroll && contains({ x: x + width - THUMB_HIT_WIDTH, y, width: THUMB_HIT_WIDTH, height }, point)
    }

    private thumbRatio() {
        const thumb = this.thumb

        return thumb ? this.maxOffset / Math.max(this.clip.height - thumb.height, 1) : 0
    }

    private clampOffset(offset: number) {
        return clamp(offset, 0, this.maxOffset)
    }

    pixel(window: CanvasWindow): Point {
        const { x, y } = window.pixel

        return {
            x: x / (this.rect.width || 1),
            y: y / (this.rect.height || 1)
        }
    }

    static grid(titles: number[], width: number, height: number, columns?: number): Panel[] {
        if (titles.length == 1 && titles[0] == 0)
            return [new Panel(0, { x: 0, y: 0, width: 1, height: 1 })]

        const cols = clamp(columns ?? Panel.getColumns(titles.length, width, height), 1, titles.length)
        const rows = Math.ceil(titles.length / cols)

        const cellWidth = Math.max((width - GAP * (cols - 1)) / cols, 0)
        const cellHeight = Math.max((height - GAP * (rows - 1)) / rows, 0)
        const lastOffset = (rows * cols - titles.length) * (cellWidth + GAP) / 2

        return titles.map((title, index) => {
            const row = Math.floor(index / cols)
            const x = (index % cols) * (cellWidth + GAP) + (row == rows - 1 ? lastOffset : 0)
            const y = row * (cellHeight + GAP) + title

            return new Panel(index, {
                x: width > 0 ? x / width : 0,
                y: height > 0 ? y / height : 0,
                width: width > 0 ? cellWidth / width : 1,
                height: height > 0 ? Math.max(cellHeight - title, 0) / height : 1
            })
        })
    }

    private static getColumns(count: number, width: number, height: number) {
        let best = 1
        let bestSize = -1

        for (let cols = 1; cols <= count; cols++) {
            const size = Math.min(width / cols, height / Math.ceil(count / cols))

            if (size > bestSize) {
                best = cols
                bestSize = size
            }
        }

        return best
    }
}