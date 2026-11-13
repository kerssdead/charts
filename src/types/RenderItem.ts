import { AnimationTiming, COORDS_MAX_X, COORDS_MAX_Y, DEFAULT_LINE_WIDTH } from '@/static/constants/Index'
import CanvasWindow from '@/types/CanvasWindow'
import RenderItemBase, { Bounds } from '@/types/interfaces/RenderItemBase'
import Point from '@/types/Point'
import AnimationData from '@/animation/AnimationData'
import ItemData from '@/types/ItemData'
import HoverProgress from '@/types/HoverProgress'
import Panel from '@/types/Panel'
import { contains } from '@/helpers/Geometry'
import RectangleDimensions from '@/types/RectangleDimensions'
import { grayScale } from '@/helpers/Color'
import { LineJoin } from '@/static/Enums'

const SOLID_LINE: number[] = []

const SCREEN_AREA: RectangleDimensions = { x: 0, y: 0, width: 0, height: 0 }

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

    color?: string

    animation: AnimationData = new AnimationData()

    stroke?: string

    tooltipTemplate?: string

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
        if (!this.animateFrame(now))
            return

        const clip = this.scrollPanel?.clip
        const bounds = this.adjustShape(window)

        if (bounds && !RenderItem.overlaps(bounds, clip ?? RenderItem.getScreenArea(screen)))
            return

        const isClipped = clip !== undefined && !(bounds && RenderItem.isInside(bounds, clip))

        if (isClipped)
            RenderItem.clipTo(ctx, clip)

        this.draw(ctx)

        if (isClipped)
            ctx.restore()
    }

    private animateFrame(now: DOMHighResTimeStamp) {
        const hasLeft = this.animation.stepInit(now)
        const isRemoved = this.animation.stepMorph(now)

        if (hasLeft || isRemoved)
            this.isTemp = true

        if (this.isGhost && !this.animation.isMorphing)
            return false

        this.animation.updateVisibility(this.isFading)

        return this.animation.init > 0
    }

    private adjustShape(window: CanvasWindow) {
        this.shape.adjust(this.scrollPanel?.body ?? this.panel?.window ?? window, this.animation.morph)

        return this.shape.getBounds()
    }

    private draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()

        ctx.globalAlpha *= this.animation.visibility

        ctx.lineWidth = DEFAULT_LINE_WIDTH
        ctx.lineJoin = LineJoin.Miter
        ctx.setLineDash(SOLID_LINE)

        const fill = this.fill
        const stroke = this.stroke ?? fill

        if (fill)
            ctx.fillStyle = fill

        if (stroke)
            ctx.strokeStyle = stroke

        this.shape.render(ctx, this)
    }

    private static clipTo(ctx: CanvasRenderingContext2D, clip: RectangleDimensions) {
        ctx.save()

        ctx.beginPath()
        ctx.rect(clip.x, clip.y, clip.width, clip.height)
        ctx.clip()
    }

    private static getScreenArea(screen: CanvasWindow) {
        SCREEN_AREA.width = screen.width
        SCREEN_AREA.height = screen.height

        return SCREEN_AREA
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

    canHoverGroupAt(point: Point) {
        return this.hoverGroup != null && this.isInteractive && !this.isInitializing && this.in(point)
    }

    hasTooltipAt(point: Point) {
        return !this.isInitializing && this.in(point) && !!(this.tooltipAt(point) || this.tooltipHtml)
    }

    tooltipAt(point: Point) {
        return this.shape.tooltipAt(point) ?? this.tooltipTemplate
    }

    isClickableAt(point: Point, isContextOpen: boolean) {
        return !!this.onClick && !this.isInitializing && (!isContextOpen || this.isMenuButton) && this.in(point)
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

        this.animation.startMorph(this.getMorphFade(previous), duration)
    }

    private getMorphFade(previous: RenderItem) {
        if (previous.isGhost)
            return 'in'

        if (this.isGhost)
            return 'out'

        return null
    }

    appear(duration: number, mapY?: (y: number) => number) {
        if (!this.shape.appear(mapY))
            return this.animation.startInit(duration, false)

        this.morphIn(duration, this.animation.appearDelay)
    }

    disappear(duration: number, mapY?: (y: number) => number) {
        if (!this.shape.disappear(this.animation.morph, mapY))
            return this.animation.startInit(duration, true)

        this.morphOut(duration)
    }

    enterFromAxis(y: number, duration: number) {
        if (!this.shape.enterFromAxis(y))
            return this.animation.startInit(duration, false)

        this.morphIn(duration)
    }

    leaveToAxis(y: number, duration: number) {
        if (!this.shape.leaveToAxis(y, this.animation.morph))
            return this.animation.startInit(duration, true)

        this.morphOut(duration)
    }

    morphIn(duration: number, delay: number = 0) {
        this.animation.startMorph('in', duration, delay)
    }

    morphOut(duration: number) {
        this.animation.removeAfterMorph = true

        this.animation.startMorph('out', duration)
    }

    hoverFactor(isBackward: boolean, now: DOMHighResTimeStamp, duration: number) {
        this.hover.step(!isBackward, now, duration)

        return this.hover.value
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

    static adjustX(window: CanvasWindow, x: number) {
        return Math.round(x / COORDS_MAX_X * window.width + window.x)
    }

    static adjustY(window: CanvasWindow, y: number) {
        return Math.round(y / COORDS_MAX_Y * window.height + window.y)
    }
}