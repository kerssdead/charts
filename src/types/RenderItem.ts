import { COORDS_MAX_X, COORDS_MAX_Y, DEFAULT_LINE_WIDTH } from 'static/constants/Index'
import CanvasWindow from 'types/CanvasWindow'
import RenderItemLine from 'types/RenderItemLine'
import RenderItemRectangle from 'types/RenderItemRectangle'
import RenderItemArc from 'types/RenderItemArc'
import RenderItemGroup from 'types/RenderItemGroup'
import RenderItemBase from 'types/interfaces/RenderItemBase'
import Point from 'types/Point'
import { Renderer } from 'renderer/Renderer'
import RenderItemText from 'types/RenderItemText'
import AnimationData from 'AnimationData'
import ItemData from 'types/ItemData'
import Animations from 'Animations'
import HoverProgress from 'types/HoverProgress'
import Panel from 'types/Panel'

type Bounds = {
    left: number
    top: number
    right: number
    bottom: number
}

export default class RenderItem {
    isAnimate: boolean = false

    isTemp: boolean = false

    isDebug: boolean = false

    isContextMenu: boolean = false

    isFixed: boolean = false

    key: string | null = null

    isGhost: boolean = false

    axisValue: number | null = null

    isFading: boolean = true

    showTooltip: boolean = false

    showContextMenu: boolean = false

    hoverGroup: string | null = null

    panel: Panel | null = null

    get hasTooltip() {
        return this.tooltipTemplate && this.tooltipTemplate.length > 0
    }

    get isInitializing() {
        return this.animation.isInitializing
    }

    color: string

    animation: AnimationData = AnimationData.default

    activeColor: string

    stroke: string

    activeStroke: string

    tooltipTemplate: string

    data: ItemData | null = null

    hasContextMenu: boolean = false

    layer: number = 0

    onClick?: () => void

    line: RenderItemLine

    rect: RenderItemRectangle

    arc: RenderItemArc

    text: RenderItemText

    group: RenderItemGroup

    private readonly hover = new HoverProgress()

    private items(): RenderItemBase[] {
        return [this.line, this.rect, this.arc, this.text, this.group]
    }

    render(ctx: CanvasRenderingContext2D, window: CanvasWindow) {
        this.updateInit()
        this.updateMorph()

        if (this.isGhost && !this.animation.isMorphing) {
            return
        }

        this.updateVisibility()

        if (this.animation.init <= 0) {
            return
        }

        this.adjust(this.panel?.window ?? window)

        if (!this.isOnCanvas(ctx.canvas)) {
            return
        }

        ctx.beginPath()

        ctx.globalAlpha *= this.animation.visibility

        ctx.lineWidth = DEFAULT_LINE_WIDTH
        ctx.setLineDash([])

        ctx.fillStyle = this.activeColor
        ctx.strokeStyle = this.activeStroke ?? this.activeColor

        for (const item of this.items()) {
            item?.render(ctx, this)
            if (item)
                return
        }
    }

    animate(point: Point, hoveredGroups: Set<string> = new Set()) {
        if (!this.isAnimate || this.isInitializing) {
            return
        }

        for (const item of this.items()) {
            if (item) {
                this.continueAnimate(point, item, hoveredGroups)
                return
            }
        }
    }

    tooltip(point: Point) {
        if (!this.hasTooltip || this.isInitializing) {
            return
        }

        this.showTooltip = this.in(point)
    }

    contextMenu(point: Point) {
        if (!this.hasContextMenu && !this.group) {
            return
        }

        if (this.isInitializing) {
            return
        }

        if (this.group) {
            this.group.contextMenu(point)
            return
        }

        this.showContextMenu = this.in(point)
    }

    in(point: Point) {
        for (const item of this.items()) {
            if (item) {
                return item.isMouseOver(point)
            }
        }

        return false
    }

    morphFrom(previous: RenderItem, duration: number) {
        const morph = previous.animation.morph

        if (this.rect && previous.rect) {
            this.rect.from = previous.rect.current(morph)
            this.rect.fromRadii = previous.rect.currentRadii(morph)
        }
        else if (this.line && previous.line)
            this.line.from = previous.line.current(morph)
        else if (this.text && previous.text) {
            this.text.from = previous.text.current(morph)
            this.text.fromAngle = previous.text.orbit ? previous.text.currentAngle(morph) : null
        }
        else if (this.arc && previous.arc)
            this.arc.from = previous.arc.current(morph)
        else
            return

        this.startMorph(previous.isGhost ? 'in' : this.isGhost ? 'out' : null, duration)
    }

    enter(duration: number) {
        this.animation.isLeaving = false
        this.animation.initFade = true
        this.animation.init = 0
        this.animation.initDuration = duration
        this.animation.initDelay = 0
        this.animation.initStart = null
    }

    appear(duration: number, mapY?: (y: number) => number) {
        if (!this.rect)
            return this.enter(duration)

        const from = this.rect.current()

        if (mapY)
            from.y = mapY(from.y)

        if (this.rect.collapse.width)
            from.width = 0

        if (this.rect.collapse.height)
            from.height = 0

        this.rect.from = from

        this.startMorph('in', duration, this.animation.appearDelay)
    }

    disappear(duration: number, mapY?: (y: number) => number) {
        if (!this.rect)
            return this.leave(duration)

        this.rect.from = this.rect.current(this.animation.morph)

        if (mapY)
            this.rect.absolute.y = mapY(this.rect.from.y)

        if (this.rect.collapse.width)
            this.rect.absolute.width = 0

        if (this.rect.collapse.height)
            this.rect.absolute.height = 0

        this.animation.removeAfterMorph = true

        this.startMorph('out', duration)
    }

    appearFromAngle(angle: number, duration: number) {
        if (!this.arc)
            return this.enter(duration)

        this.arc.from = Object.assign(this.arc.current(), { startAngle: angle, endAngle: angle })

        this.startMorph('in', duration)
    }

    disappearToAngle(angle: number, duration: number) {
        if (!this.arc)
            return this.leave(duration)

        this.arc.from = this.arc.current(this.animation.morph)
        this.arc.startAngle = angle
        this.arc.endAngle = angle

        this.animation.removeAfterMorph = true

        this.startMorph('out', duration)
    }

    enterFromAxis(y: number, duration: number) {
        if (this.text)
            this.text.from = { x: this.text.absolute.x, y }
        else if (this.line)
            this.line.from = this.line.absolute.map(stop => ({ x: stop.x, y }))
        else
            return this.enter(duration)

        this.startMorph('in', duration)
    }

    leaveToAxis(y: number, duration: number) {
        const morph = this.animation.morph

        if (this.text) {
            this.text.from = this.text.current(morph)
            this.text.absolute.y = y
        } else if (this.line) {
            this.line.from = this.line.current(morph)
            this.line.absolute = this.line.absolute.map(stop => ({ x: stop.x, y }))
        } else {
            return this.leave(duration)
        }

        this.animation.removeAfterMorph = true

        this.startMorph('out', duration)
    }

    hoverFactor(isBackward: boolean, duration: number) {
        this.hover.step(!isBackward, Renderer.timer, duration)

        return this.hover.value
    }

    private startMorph(fade: 'in' | 'out' | null, duration: number, delay: number = 0) {
        this.animation.morphFade = fade
        this.animation.morph = 0
        this.animation.morphDuration = duration
        this.animation.morphDelay = delay
        this.animation.morphStart = null

        if (fade == 'in')
            this.animation.visibility = 0
    }

    leave(duration: number) {
        this.animation.isLeaving = true
        this.animation.initFade = true
        this.animation.initDuration = duration
        this.animation.initDelay = 0
        this.animation.initStart = null
    }

    private adjust(window: CanvasWindow): void {
        for (const item of this.items()) {
            item?.adjust(window, this.animation.morph)
            if (item)
                return
        }
    }

    private isOnCanvas(canvas: HTMLCanvasElement): boolean {
        const bounds = this.getBounds()

        if (!bounds) {
            return true
        }

        const margin = DEFAULT_LINE_WIDTH

        return bounds.right >= -margin && bounds.left <= canvas.width + margin
               && bounds.bottom >= -margin && bounds.top <= canvas.height + margin
    }

    private getBounds(): Bounds | null {
        if (this.line)
            return this.line.getBounds()
        else if (this.rect)
            return this.rect.getBounds()
        else if (this.arc)
            return this.arc.getBounds()
        else
            return null
    }

    private updateInit() {
        const animation = this.animation

        if (!animation.isInitializing) {
            return
        }

        animation.initStart ??= Renderer.timer

        const passed = Renderer.timer - animation.initStart - animation.initDelay
        const progress = Math.min(Math.max(passed / animation.initDuration, 0), 1)

        const transition = Animations.getTransition(progress)

        animation.init = animation.isLeaving ? 1 - transition : transition

        if (progress == 1) {
            animation.init = animation.isLeaving ? 0 : 1
            animation.initDuration = 0
            animation.initFade = animation.isLeaving

            if (animation.isLeaving)
                this.isTemp = true
        }
    }

    private updateMorph() {
        const animation = this.animation

        if (!animation.isMorphing) {
            return
        }

        animation.morphStart ??= Renderer.timer

        const passed = Renderer.timer - animation.morphStart - animation.morphDelay
        const progress = Math.min(Math.max(passed / animation.morphDuration, 0), 1)

        animation.morph = Animations.getTransition(progress)

        if (progress == 1) {
            animation.morph = 1
            animation.morphDuration = 0

            if (animation.removeAfterMorph)
                this.isTemp = true
            else
                animation.morphFade = null
        }
    }

    private updateVisibility() {
        const animation = this.animation

        if (!this.isFading)
            animation.visibility = 1
        else if (animation.initFade)
            animation.visibility = animation.init
        else if (animation.morphFade == 'in')
            animation.visibility = animation.morph
        else if (animation.morphFade == 'out')
            animation.visibility = 1 - animation.morph
        else
            animation.visibility = 1
    }

    private continueAnimate(point: Point, item: RenderItemBase, hoveredGroups: Set<string>) {
        const isOver = this.hoverGroup == null
                       ? item.isMouseOver(point)
                       : hoveredGroups.size > 0 && !hoveredGroups.has(this.hoverGroup)

        if (!isOver && this.hover.isIdle)
            return

        item.animate(this, !isOver, point)
    }

    static adjustX(window: CanvasWindow, x: number) {
        return Math.round(x / COORDS_MAX_X * window.width + window.x)
    }

    static adjustY(window: CanvasWindow, y: number) {
        return Math.round(y / COORDS_MAX_Y * window.height + window.y)
    }

    static reAdjustX(window: CanvasWindow, x: number): number {
        return ((x - window.x) * COORDS_MAX_X) / window.width
    }

    static reAdjustY(window: CanvasWindow, y: number): number {
        return ((y - window.y) * COORDS_MAX_Y) / window.height
    }

    static reAdjustWidth(window: CanvasWindow, width: number): number {
        return width * COORDS_MAX_X / window.width
    }

    static reAdjustHeight(window: CanvasWindow, height: number): number {
        return height * COORDS_MAX_Y / window.height
    }
}