import Queue from 'render/Queue'
import Canvas from 'helpers/Canvas'
import Point from 'types/Point'
import { ChartType, Events } from 'static/Enums'
import Debug from '../Debug'
import CanvasWindow from '../types/CanvasWindow'
import { Animations, COORDS_MAX_X, COORDS_MAX_Y, ZOOM_DEFAULT_STEP } from 'static/constants/Index'
import RenderItem from '../types/RenderItem'
import PlotProcess from './PlotProcess'
import Data from '../types/interfaces/Data'
import PlotData from '../types/data/PlotData'
import ChartSettings from '../types/ChartSettings'
import PieProcess from './PieProcess'
import PieData from '../types/data/PieData'
import TreeProcess from './TreeProcess'
import TreeData from '../types/data/TreeData'
import GaugeProcess from './GaugeProcess'
import GaugeData from '../types/data/GaugeData'
import QueueItemsBuilder from '../builders/QueueItemsBuilder'
import Paddings from '../types/Paddings'
import Legend from '../Legend'

type AttachedEvent = {
    target: EventTarget
    type: string
    listener: (event: any) => void
}

// todo: "Renderer" is better name for this class
export class DefaultRenderer {
    static timer: DOMHighResTimeStamp = 0

    private queue: Queue

    private window: CanvasWindow

    private screen: CanvasWindow

    private legend: Legend | undefined

    private reserved: Paddings | null = null

    private moveStartPosition: Point | null

    private moveStartWindow: Point | null

    private currentMousePoint: Point | null

    private contextMenuPoint: Point | null

    private isOpenContext: boolean = false

    private readonly canvas: HTMLCanvasElement

    private settings: ChartSettings

    private events: AttachedEvent[] = []

    private frame: number | null = null

    private isDestroyed: boolean = false

    private isApplied: boolean = false

    private plot: PlotProcess | null = null

    private get pixel(): Point {
        return {
            x: COORDS_MAX_X / this.window.width,
            y: COORDS_MAX_Y / this.window.height
        }
    }

    constructor(canvas: HTMLCanvasElement,
                settings: ChartSettings) {
        Debug.initialize(settings.enableDebugMode)

        this.canvas = canvas
        this.queue = new Queue(Canvas.getContext(this.canvas))

        this.calculateWindow()

        this.settings = settings

        this.attachEvents()
    }

    apply(settings: ChartSettings) {
        Debug.initialize(settings.enableDebugMode)

        this.settings = settings

        this.detachEvents()
        this.attachEvents()

        if (this.isApplied)
            this.rebuildAnimated()
        else
            this.rebuild(false)

        this.isApplied = true
    }

    private rebuild(skipInit: boolean) {
        this.legend?.clear(this.queue)

        this.queue.destroy()

        this.contextMenuPoint = null
        this.isOpenContext = false

        this.add(this.settings.type, this.settings.data)

        if (skipInit) {
            for (const item of this.queue.queue) {
                item.animation.init = 1
                item.animation.initDuration = 0
            }
        }
    }

    private attachEvents() {
        if (this.settings.enableMove) {
            this.listen(this.canvas, Events.MouseDown, (event: MouseEvent) => {
                this.onMouseDown(event)
            })
            this.listen(document, Events.MouseMove, (event: MouseEvent) => {
                this.onMouseMove(event)
            })
            this.listen(document, Events.MouseUp, () => {
                this.onMouseUp()
            })
            this.listen(this.canvas, Events.Wheel, (event: WheelEvent) => {
                this.onWheel(event)
            })
        }

        this.listen(this.canvas, Events.MouseMove, (event: MouseEvent) => {
            this.onMouseMove2(event)
        })
        this.listen(this.canvas, Events.ContextMenu, (event: MouseEvent) => {
            this.onContextMenu(event)
        })
        this.listen(this.canvas, Events.Click, (event: MouseEvent) => {
            this.onMouseClick(event)
        })
        this.listen(document, Events.Click, (event: MouseEvent) => {
            this.onContextMenuClick(event)
        })
        this.listen(this.canvas, Events.MouseMove, (event: MouseEvent) => {
            this.DEBUGonMouseMove(event)
        })
    }

    private detachEvents() {
        for (const { target, type, listener } of this.events) {
            target.removeEventListener(type, listener)
        }

        this.events = []
    }

    destroy() {
        this.isDestroyed = true

        if (this.frame != null) {
            cancelAnimationFrame(this.frame)
            this.frame = null
        }

        this.detachEvents()

        this.legend = undefined

        this.queue.destroy()

        this.moveStartPosition = null
        this.moveStartWindow = null
        this.currentMousePoint = null
        this.contextMenuPoint = null
        this.isOpenContext = false
    }

    render(): void {
        if (this.isDestroyed) {
            return
        }

        if (this.frame != null) {
            cancelAnimationFrame(this.frame)
        }

        DefaultRenderer.timer = performance.now()

        this.queue.animate(this.currentMousePoint)

        this.queue.tooltip(this.window, this.currentMousePoint, this.isOpenContext)
        this.queue.contextMenu(this.window, this.contextMenuPoint, this.currentMousePoint, this.isOpenContext)

        this.legend?.build(this.queue, this.currentMousePoint)

        // todo: exclude render not in CanvasWindow
        this.queue.render(this.window, this.screen)

        this.frame = requestAnimationFrame(() => {
            this.render()
        })
    }

    add(type: ChartType, ...data: Data[]) {
        for (const item of data) {
            switch (type) {
                case ChartType.Plot:
                    let plotProcess = new PlotProcess(item as PlotData, this.pixel)

                    this.plot = plotProcess

                    this.queue.add(plotProcess.getTitles(this.settings.title))
                    this.queue.add(plotProcess.getBase())
                    this.queue.add(...plotProcess.getData())

                    break

                case ChartType.Pie:
                    let pieProcess = new PieProcess(item as PieData, this.pixel)

                    this.queue.add(...pieProcess.getData())

                    break

                case ChartType.TreeMap:
                    let treeProcess = new TreeProcess(item as TreeData)

                    this.queue.add(...treeProcess.getData())

                    break

                case ChartType.Gauge:
                    let gaugeProcess = new GaugeProcess(item as GaugeData)

                    this.queue.add(...gaugeProcess.getData())

                    break
            }
        }
    }

    setLegend(legend: Legend | undefined) {
        if (this.legend) {
            this.legend.clear(this.queue)
            this.legend.onChange = undefined
        }

        this.legend = legend

        if (this.legend)
            this.legend.onChange = () => {
                this.rebuildAnimated()
            }
    }

    private rebuildAnimated() {
        if (!this.isApplied)
            return

        const previous = new Map<string, RenderItem>()
        const previousPlot = this.plot

        this.plot = null

        for (const item of this.queue.queue)
            if (item.key != null && !item.animation.isLeaving && !item.animation.removeAfterMorph)
                previous.set(item.key, item)

        this.rebuild(true)

        const nextPlot = this.plot as PlotProcess | null

        const duration = Animations.legend

        const verticalPrevious = previousPlot && !previousPlot.isHorizontal ? previousPlot : null
        const verticalNext = nextPlot && !nextPlot.isHorizontal ? nextPlot : null

        const toPrevious = verticalPrevious && verticalNext
                           ? (y: number) => verticalPrevious.getAxisY(verticalNext.getAxisValue(y))
                           : undefined
        const toNext = verticalPrevious && verticalNext
                       ? (y: number) => verticalNext.getAxisY(verticalPrevious.getAxisValue(y))
                       : undefined

        const matches = new Map<RenderItem, RenderItem>()

        const appearedArcs: RenderItem[] = []

        for (const item of this.queue.queue) {
            if (item.key == null)
                continue

            const old = previous.get(item.key)

            previous.delete(item.key)

            if (old)
                matches.set(item, old)

            if (old?.isGhost && item.isGhost)
                continue

            if (old)
                item.morphFrom(old, duration)
            else if (item.axisValue != null && verticalPrevious)
                item.enterFromAxis(verticalPrevious.getAxisY(item.axisValue), duration)
            else if (item.arc && !item.isGhost)
                appearedArcs.push(item)
            else if (!item.isGhost)
                item.appear(duration, toPrevious)
        }

        const removed = Array.from(previous.values())

        this.animateArcs(appearedArcs, removed, matches, duration)

        for (const item of removed) {
            if (item.isGhost || item.arc)
                continue

            if (item.axisValue != null && verticalNext)
                item.leaveToAxis(verticalNext.getAxisY(item.axisValue), duration)
            else
                item.disappear(duration, toNext)

            this.queue.queue.push(item)
        }
    }

    private animateArcs(appeared: RenderItem[], removed: RenderItem[], matches: Map<RenderItem, RenderItem>, duration: number) {
        const epsilon = 1e-9

        const newArcs = this.queue.queue.filter(item => item.arc != null)
        const newByOld = new Map<RenderItem, RenderItem>()

        for (const [item, old] of matches)
            newByOld.set(old, item)

        const oldArcs = [...matches.values(), ...removed].filter(item => item.arc != null)

        const previousEnd = (item: RenderItem, visited: Set<RenderItem>): number => {
            visited.add(item)

            const before = newArcs.filter(other => {
                return !visited.has(other) && Math.abs(other.arc.endAngle - item.arc.startAngle) < epsilon
            })

            const matched = before.find(other => matches.has(other))

            if (matched) {
                const old = matches.get(matched)!

                return old.arc.current(old.animation.morph).endAngle
            }

            return before.length > 0
                   ? previousEnd(before[0], visited)
                   : item.arc.startAngle
        }

        const nextEnd = (item: RenderItem, visited: Set<RenderItem>): number => {
            visited.add(item)

            const start = item.arc.current(item.animation.morph).startAngle

            const before = oldArcs.filter(other => {
                return !visited.has(other)
                       && Math.abs(other.arc.current(other.animation.morph).endAngle - start) < epsilon
            })

            const matched = before.find(other => newByOld.has(other))

            if (matched)
                return newByOld.get(matched)!.arc.endAngle

            return before.length > 0
                   ? nextEnd(before[0], visited)
                   : start
        }

        const appearAngles = appeared.map(item => previousEnd(item, new Set()))
        const removeAngles = removed.map(item => item.arc && !item.isGhost ? nextEnd(item, new Set()) : 0)

        appeared.forEach((item, i) => {
            item.appearFromAngle(appearAngles[i], duration)
        })

        removed.forEach((item, i) => {
            if (!item.arc || item.isGhost)
                return

            item.disappearToAngle(removeAngles[i], duration)

            this.queue.queue.push(item)
        })
    }

    private listen(target: EventTarget, type: string, listener: (event: any) => void) {
        target.addEventListener(type, listener)

        this.events.push({ target, type, listener })
    }

    /**
     * Uses for moving on canvas using mouse
     */
    // todo: meh name
    private onMouseDown(event: MouseEvent) {
        this.moveStartPosition = { x: event.offsetX, y: event.offsetY }
        this.moveStartWindow = { x: this.window.x, y: this.window.y }
    }

    /**
     * Uses for moving on canvas using mouse
     */
    // todo: meh name
    private onMouseMove(event: MouseEvent) {
        if (this.moveStartPosition == null || this.moveStartWindow == null)
            return

        this.window.moveTo(
            this.moveStartWindow.x + event.offsetX - this.moveStartPosition.x,
            this.moveStartWindow.y + event.offsetY - this.moveStartPosition.y
        )
    }

    /**
     * Uses for moving on canvas using mouse
     */
    // todo: meh name
    private onMouseUp() {
        this.moveStartPosition = null
        this.moveStartWindow = null
    }

    /**
     * Uses for zoom canvas using middle mouse button
     */
    // todo: meh name
    private onWheel(event: WheelEvent) {
        event.preventDefault()

        const xRatio = event.offsetX / this.canvas.width - .5
        const yRatio = event.offsetY / this.canvas.height - .5

        if (event.deltaY > 0) {
            this.window.in(ZOOM_DEFAULT_STEP, xRatio, yRatio)
        }

        if (event.deltaY < 0) {
            this.window.out(-ZOOM_DEFAULT_STEP, xRatio, yRatio)
        }
    }

    private getMousePoint(event: MouseEvent): Point {
        const onCanvas = {
            x: event.offsetX - this.window.x,
            y: event.offsetY - this.window.y
        }

        return {
            x: RenderItem.adjustX(this.window, onCanvas.x / this.window.width * COORDS_MAX_X),
            y: RenderItem.adjustY(this.window, onCanvas.y / this.window.height * COORDS_MAX_Y)
        }
    }

    /**
     * Uses for intercept mouse moving on canvas
     */
    // todo: meh name
    private onMouseMove2(event: MouseEvent) {
        this.currentMousePoint = this.getMousePoint(event)
    }

    /**
     * Uses for intercept opening context menu
     */
    // todo: meh name
    private onContextMenu(event: MouseEvent) {
        event.preventDefault()
        event.stopPropagation()

        this.isOpenContext = true
        this.contextMenuPoint = this.getMousePoint(event)
    }

    /**
     * Uses for intercept closing context menu when click outside
     */
    private onContextMenuClick(event: MouseEvent) {
        this.isOpenContext = false
        this.contextMenuPoint = null
    }

    /**
     * Uses for process mouse click on rendered item
     */
    private onMouseClick(event: MouseEvent) {
        const items = this.isOpenContext
                      ? this.queue.queue.filter(item => item.isContextMenu)
                      : this.queue.queue

        for (const item of items) {
            if (item.in(this.getMousePoint(event))) {
                item.color = 'green'
                item.activeColor = 'green'

                if (item.onClick) {
                    item.onClick()
                }
            }
        }
    }

    private DEBUGonMouseMove(event: MouseEvent) {
        if (!Debug.isEnabled) {
            return
        }

        for (const item of this.queue.queue.filter(item => !item.isDebug)) {
            const pos = this.getMousePoint(event)

            if (item.in(pos)) {
                this.queue.add((items: QueueItemsBuilder) => {
                    items.rect()
                         .position(pos.x, pos.y)
                         .size(200, 200)
                         .fill()
                         .color('#ff000077')
                         .temp()
                         .debug()
                })
            }
        }
    }

    calculateWindow(reserved?: Paddings | null) {
        if (reserved !== undefined)
            this.reserved = reserved

        const previous = this.window

        this.window = new CanvasWindow(this.canvas)
        this.screen = new CanvasWindow(this.canvas)

        if (this.reserved == null) {
            this.rebuildIfResized(previous)

            return
        }

        this.window.x = this.reserved.left
        this.window.y = this.reserved.top
        this.window.width = Math.max(this.window.width - this.reserved.left - this.reserved.right, 0)
        this.window.height = Math.max(this.window.height - this.reserved.top - this.reserved.bottom, 0)

        this.rebuildIfResized(previous)
    }

    private rebuildIfResized(previous: CanvasWindow | undefined) {
        if (!previous)
            return

        if (previous.width == this.window.width && previous.height == this.window.height)
            return

        if (this.isApplied && this.window.width > 0 && this.window.height > 0)
            this.rebuild(true)
    }
}