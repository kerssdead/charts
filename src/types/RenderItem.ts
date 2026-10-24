import { AnimationTiming, COORDS_MAX_X, COORDS_MAX_Y, DEFAULT_LINE_WIDTH } from '@/static/constants/Index'
import CanvasWindow from '@/types/CanvasWindow'
import RenderItemBase, { Bounds } from '@/types/interfaces/RenderItemBase'
import Point from '@/types/Point'
import AnimationData from '@/animation/AnimationData'
import ItemData from '@/types/ItemData'
import ease from '@/animation/Animations'
import HoverProgress from '@/types/HoverProgress'
import Panel from '@/types/Panel'
import { clamp, contains } from '@/helpers/Geometry'
import RectangleDimensions from '@/types/RectangleDimensions'
import { grayScale } from '@/helpers/Color'

export default class RenderItem {
    isInteractive: boolean = false

    isTemp: boolean = false

    isMenuButton: boolean = false

    isFixed: boolean = false

    isScrollable: boolean = false

    key: string | null = null

    isGhost: boolean = false

    axisValue: number | null = null

    isFading: boolean = true

    isMonochrome: boolean = false

    hoverGroup: string | null = null

    panel: Panel | null = null

    get isInitializing() {
        return this.animation.isInitializing
    }

    get fill(): string | undefined {
        const color = this.color ?? this.shape.defaultColor

        return color && grayScale(color, this.animation.mono)
    }

    color: string

    animation: AnimationData = new AnimationData()

    stroke: string

    tooltipTemplate: string

    tooltipHtml: string | null = null

    data: ItemData | null = null

    hasContextMenu: boolean = false

    layer: number = 0

    onClick?: () => void

    readonly shape: RenderItemBase

    private readonly hover = new HoverProgress()

    constructor(shape: RenderItemBase) {
        this.shape = shape
    }

    render(ctx: CanvasRenderingContext2D, window: CanvasWindow, screen: CanvasWindow, now: DOMHighResTimeStamp) {
        this.updateInit(now)
        this.updateMorph(now)

        if (this.isGhost && !this.animation.isMorphing) {
            return
        }

        this.updateVisibility()

        if (this.animation.init <= 0) {
            return
        }

        const scroll = this.scrollPanel

        this.shape.adjust(scroll?.body ?? this.panel?.window ?? window, this.animation.morph)

        const bounds = this.shape.getBounds()
        const clip = scroll?.clip

        if (bounds && !RenderItem.overlaps(bounds, clip ?? { x: 0, y: 0, width: screen.width, height: screen.height })) {
            return
        }

        const isClipped = clip != undefined && !(bounds && RenderItem.isInside(bounds, clip))

        if (isClipped) {
            ctx.save()

            ctx.beginPath()
            ctx.rect(clip.x, clip.y, clip.width, clip.height)
            ctx.clip()
        }

        ctx.beginPath()

        ctx.globalAlpha *= this.animation.visibility

        ctx.lineWidth = DEFAULT_LINE_WIDTH
        ctx.setLineDash([])

        const fill = this.fill
        const stroke = this.stroke ?? fill

        if (fill)
            ctx.fillStyle = fill

        if (stroke)
            ctx.strokeStyle = stroke

        this.shape.render(ctx, this)

        if (isClipped)
            ctx.restore()
    }

    animate(point: Point, now: DOMHighResTimeStamp, hoveredGroups: Set<string>): boolean {
        if (!this.isInteractive || this.isInitializing) {
            return false
        }

        const isOver = this.hoverGroup == null
                       ? this.in(point)
                       : hoveredGroups.size > 0 && !hoveredGroups.has(this.hoverGroup)

        const isShapeAnimating = this.shape.animateHover(now)

        if (!isOver && this.hover.isIdle)
            return isShapeAnimating

        if (this.isMonochrome)
            this.animation.mono = this.hoverFactor(!isOver, now, AnimationTiming.hover)
        else
            this.shape.animate(this, !isOver, now)

        return this.hover.isAnimating || isShapeAnimating
    }

    hasTooltipAt(point: Point) {
        return !this.isInitializing && this.in(point) && !!(this.tooltipAt(point) || this.tooltipHtml)
    }

    tooltipAt(point: Point) {
        return this.shape.tooltipAt(point) ?? this.tooltipTemplate
    }

    hasContextMenuAt(point: Point) {
        return this.hasContextMenu && !this.isInitializing && this.in(point)
    }

    in(point: Point) {
        const clip = this.scrollPanel?.clip

        return (!clip || contains(clip, point)) && this.shape.isMouseOver(point)
    }

    private get scrollPanel() {
        return this.isScrollable && this.panel?.canScroll ? this.panel : null
    }

    morphFrom(previous: RenderItem, duration: number) {
        if (!this.shape.morphFrom(previous.shape, previous.animation.morph))
            return

        Object.assign(this.hover, previous.hover)

        this.startMorph(previous.isGhost ? 'in' : this.isGhost ? 'out' : null, duration)
    }

    private startInit(duration: number, isLeaving: boolean) {
        if (!isLeaving)
            this.animation.init = 0

        this.animation.isLeaving = isLeaving
        this.animation.initFade = true
        this.animation.initDuration = duration
        this.animation.initDelay = isLeaving ? 0 : this.animation.appearDelay
        this.animation.initStart = null
    }

    appear(duration: number, mapY?: (y: number) => number) {
        if (!this.shape.appear(mapY))
            return this.startInit(duration, false)

        this.morphIn(duration, this.animation.appearDelay)
    }

    disappear(duration: number, mapY?: (y: number) => number) {
        if (!this.shape.disappear(this.animation.morph, mapY))
            return this.startInit(duration, true)

        this.morphOut(duration)
    }

    enterFromAxis(y: number, duration: number) {
        if (!this.shape.enterFromAxis(y))
            return this.startInit(duration, false)

        this.morphIn(duration)
    }

    leaveToAxis(y: number, duration: number) {
        if (!this.shape.leaveToAxis(y, this.animation.morph))
            return this.startInit(duration, true)

        this.morphOut(duration)
    }

    morphIn(duration: number, delay: number = 0) {
        this.startMorph('in', duration, delay)
    }

    morphOut(duration: number) {
        this.animation.removeAfterMorph = true

        this.startMorph('out', duration)
    }

    hoverFactor(isBackward: boolean, now: DOMHighResTimeStamp, duration: number) {
        this.hover.step(!isBackward, now, duration)

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

    private static overlaps(bounds: Bounds, area: RectangleDimensions): boolean {
        const margin = DEFAULT_LINE_WIDTH

        return bounds.right >= area.x - margin && bounds.left <= area.x + area.width + margin
               && bounds.bottom >= area.y - margin && bounds.top <= area.y + area.height + margin
    }

    private static isInside(bounds: Bounds, area: RectangleDimensions): boolean {
        const margin = DEFAULT_LINE_WIDTH

        return bounds.left >= area.x + margin && bounds.right <= area.x + area.width - margin
               && bounds.top >= area.y + margin && bounds.bottom <= area.y + area.height - margin
    }

    private static progress(now: DOMHighResTimeStamp, start: DOMHighResTimeStamp, delay: number, duration: number) {
        return clamp((now - start - delay) / duration, 0, 1)
    }

    private updateInit(now: DOMHighResTimeStamp) {
        const animation = this.animation

        if (!animation.isInitializing) {
            return
        }

        animation.initStart ??= now

        const progress = RenderItem.progress(now, animation.initStart, animation.initDelay, animation.initDuration)

        const transition = ease(progress)

        animation.init = animation.isLeaving ? 1 - transition : transition

        if (progress == 1) {
            animation.init = animation.isLeaving ? 0 : 1
            animation.initDuration = 0
            animation.initFade = animation.isLeaving

            if (animation.isLeaving)
                this.isTemp = true
        }
    }

    private updateMorph(now: DOMHighResTimeStamp) {
        const animation = this.animation

        if (!animation.isMorphing) {
            return
        }

        animation.morphStart ??= now

        const progress = RenderItem.progress(now, animation.morphStart, animation.morphDelay, animation.morphDuration)

        animation.morph = ease(progress)

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

    static adjustX(window: CanvasWindow, x: number) {
        return Math.round(x / COORDS_MAX_X * window.width + window.x)
    }

    static adjustY(window: CanvasWindow, y: number) {
        return Math.round(y / COORDS_MAX_Y * window.height + window.y)
    }
}