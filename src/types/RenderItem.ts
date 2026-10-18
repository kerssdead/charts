import { COORDS_MAX_X, COORDS_MAX_Y, DEFAULT_LINE_WIDTH } from '@/static/constants/Index'
import CanvasWindow from '@/types/CanvasWindow'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import Point from '@/types/Point'
import { Renderer } from '@/renderer/Renderer'
import AnimationData from '@/AnimationData'
import ItemData from '@/types/ItemData'
import Animations from '@/Animations'
import HoverProgress from '@/types/HoverProgress'
import Panel from '@/types/Panel'

export default class RenderItem {
    isAnimate: boolean = false

    isTemp: boolean = false

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

    readonly shape: RenderItemBase

    private readonly hover = new HoverProgress()

    constructor(shape: RenderItemBase) {
        this.shape = shape
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

        this.shape.render(ctx, this)
    }

    animate(point: Point, hoveredGroups: Set<string> = new Set()) {
        if (!this.isAnimate || this.isInitializing) {
            return
        }

        this.continueAnimate(point, hoveredGroups)
    }

    tooltip(point: Point) {
        if (!this.hasTooltip || this.isInitializing) {
            return
        }

        this.showTooltip = this.in(point)
    }

    contextMenu(point: Point) {
        if (!this.hasContextMenu || this.isInitializing) {
            return
        }

        this.showContextMenu = this.in(point)
    }

    in(point: Point) {
        return this.shape.isMouseOver(point)
    }

    morphFrom(previous: RenderItem, duration: number) {
        if (!this.shape.morphFrom(previous.shape, previous.animation.morph))
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
        if (!this.shape.appear(mapY))
            return this.enter(duration)

        this.morphIn(duration, this.animation.appearDelay)
    }

    disappear(duration: number, mapY?: (y: number) => number) {
        if (!this.shape.disappear(this.animation.morph, mapY))
            return this.leave(duration)

        this.morphOut(duration)
    }

    enterFromAxis(y: number, duration: number) {
        if (!this.shape.enterFromAxis(y))
            return this.enter(duration)

        this.morphIn(duration)
    }

    leaveToAxis(y: number, duration: number) {
        if (!this.shape.leaveToAxis(y, this.animation.morph))
            return this.leave(duration)

        this.morphOut(duration)
    }

    morphIn(duration: number, delay: number = 0) {
        this.startMorph('in', duration, delay)
    }

    morphOut(duration: number) {
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
        this.shape.adjust(window, this.animation.morph)
    }

    private isOnCanvas(canvas: HTMLCanvasElement): boolean {
        const bounds = this.shape.getBounds()

        if (!bounds) {
            return true
        }

        const margin = DEFAULT_LINE_WIDTH

        return bounds.right >= -margin && bounds.left <= canvas.clientWidth + margin
               && bounds.bottom >= -margin && bounds.top <= canvas.clientHeight + margin
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

    private continueAnimate(point: Point, hoveredGroups: Set<string>) {
        const isOver = this.hoverGroup == null
                       ? this.shape.isMouseOver(point)
                       : hoveredGroups.size > 0 && !hoveredGroups.has(this.hoverGroup)

        if (!isOver && this.hover.isIdle)
            return

        this.shape.animate(this, !isOver, point)
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