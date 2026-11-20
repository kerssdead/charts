import { AnimationTiming, DEFAULT_LINE_WIDTH } from '@/static/constants/Index'
import CanvasWindow from '@/types/CanvasWindow'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import { boundsInside, boundsOverlap } from '@/helpers/Bounds'
import Point from '@/types/Point'
import AnimationData from '@/animation/AnimationData'
import ItemData from '@/types/ItemData'
import HoverProgress from '@/types/HoverProgress'
import Panel from '@/types/Panel'
import Rectangle from '@/helpers/Rectangle'
import RectangleDimensions from '@/types/RectangleDimensions'
import { grayScale } from '@/helpers/Color'
import { LineJoin, MorphFade } from '@/static/Enums'
import { ItemFlag as f } from '@/static/ItemFlag'
import { Tooltip, resolveTooltip } from '@/types/Tooltip'
import { LIGHT_THEME, ThemePalette } from '@/Theme'
import RenderFrame from '@/types/RenderFrame'

const SOLID_LINE: number[] = []

const SCREEN_AREA = Rectangle.empty()

export default class RenderItem {
    key: string | null = null

    axisValue: number | null = null

    isInstant: boolean = false

    hoverGroup: string | null = null

    panel: Panel | null = null

    color?: string

    stroke?: string

    tooltipTemplate?: Tooltip

    data: ItemData | null = null

    layer: number = 0

    onClick?: () => void

    focusOrder: number | null = null

    animation: AnimationData = new AnimationData()

    readonly shape: RenderItemBase

    private flags: number = f.Fading

    private palette: ThemePalette = LIGHT_THEME

    private readonly hover = new HoverProgress()

    private hoverChanged: boolean = false

    constructor(shape: RenderItemBase) {
        this.shape = shape
    }

    get isInitializing() {
        return this.animation.isInitializing
    }

    get fill(): string | undefined {
        const color = this.color ?? this.shape.defaultColor(this.palette)

        return color && grayScale(color, this.animation.grayscale)
    }

    is(flag: f) {
        return (this.flags & flag) !== 0
    }

    set(flag: f, value: boolean) {
        this.flags = value ? this.flags | flag : this.flags & ~flag
    }

    setGhost(isGhost: boolean) {
        this.set(f.Ghost, isGhost)

        if (isGhost) {
            this.set(f.Interactive, false)
            this.set(f.ContextMenu, false)
            this.tooltipTemplate = ''
        }
    }

    render(ctx: CanvasRenderingContext2D, { window, screen, now, theme }: RenderFrame) {
        if (!this.animateFrame(now))
            return

        const clip = this.scrollPanel?.clip
        const bounds = this.adjustShape(window)

        if (bounds && !boundsOverlap(bounds, clip ?? RenderItem.getScreenArea(screen)))
            return

        const isClipped = clip !== undefined && !(bounds && boundsInside(bounds, clip))

        if (isClipped)
            RenderItem.clipTo(ctx, clip)

        this.draw(ctx, theme)

        if (isClipped)
            ctx.restore()
    }

    private animateFrame(now: DOMHighResTimeStamp) {
        const hasLeft = this.animation.stepInit(now)
        const isRemoved = this.animation.stepMorph(now)

        if (hasLeft || isRemoved)
            this.set(f.Removable, true)

        if (this.is(f.Ghost) && !this.animation.isMorphing)
            return false

        this.animation.updateVisibility(this.is(f.Fading))

        return this.animation.init > 0
    }

    private adjustShape(window: CanvasWindow) {
        this.shape.adjust(this.scrollPanel?.body ?? this.panel?.window ?? window, this.animation.morph)

        return this.shape.getBounds()
    }

    private draw(ctx: CanvasRenderingContext2D, theme: ThemePalette) {
        ctx.beginPath()

        ctx.globalAlpha *= this.animation.visibility

        ctx.lineWidth = DEFAULT_LINE_WIDTH
        ctx.lineJoin = LineJoin.Miter
        ctx.setLineDash(SOLID_LINE)

        this.palette = theme

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

    animate(point: Point, now: DOMHighResTimeStamp, hoveredGroups: Set<string>, isInstant = false): boolean {
        if (!this.is(f.Interactive) || this.isInitializing)
            return false

        this.isInstant = isInstant
        this.hoverChanged = false

        const isOver = this.isOverAt(point, hoveredGroups)
        const isHoverTarget = this.hoverGroup == null ? isOver : this.contains(point)
        const isShapeAnimating = this.shape.animateHover(isHoverTarget ? point : null, now, isInstant)

        if (!isOver && this.hover.isIdle)
            return isShapeAnimating

        return this.animateHoverProgress(isOver, now) || isShapeAnimating || this.hoverChanged
    }

    private animateHoverProgress(isOver: boolean, now: DOMHighResTimeStamp) {
        if (this.is(f.Monochrome))
            this.animation.grayscale = this.hoverFactor(!isOver, now, AnimationTiming.hover)
        else
            this.shape.animate(this, !isOver, now)

        return this.hover.isAnimating
    }

    private isOverAt(point: Point, hoveredGroups: Set<string>) {
        return this.hoverGroup == null
               ? this.contains(point)
               : hoveredGroups.size > 0 && !hoveredGroups.has(this.hoverGroup)
    }

    canHoverGroupAt(point: Point) {
        return this.hoverGroup != null && this.is(f.Interactive) && !this.isInitializing && this.contains(point)
    }

    hasTooltipAt(point: Point) {
        return !this.isInitializing && this.contains(point) && !!this.tooltipAt(point)
    }

    tooltipAt(point: Point) {
        return this.shape.tooltipAt(point) ?? resolveTooltip(this.tooltipTemplate ?? null)
    }

    isClickableAt(point: Point, isContextOpen: boolean) {
        return !!this.onClick
               && !this.isInitializing
               && (!isContextOpen || this.is(f.MenuButton))
               && this.contains(point)
    }

    hasContextMenuAt(point: Point) {
        return this.is(f.ContextMenu) && !this.isInitializing && this.contains(point)
    }

    get focusPoint() {
        return this.shape.getFocusPoint()
    }

    get focusBounds() {
        return this.shape.getFocusBounds()
    }

    contains(point: Point) {
        const clip = this.scrollPanel?.clip

        return (!clip || Rectangle.contains(clip, point)) && this.shape.isMouseOver(point)
    }

    private get scrollPanel() {
        return this.is(f.Scrollable) && this.panel?.canScroll ? this.panel : null
    }

    morphFrom(previous: RenderItem, duration: number) {
        if (!this.shape.morphFrom(previous.shape, previous.animation.morph))
            return

        Object.assign(this.hover, previous.hover)

        this.animation.startMorph(this.getMorphFade(previous), duration)
    }

    private getMorphFade(previous: RenderItem) {
        if (previous.is(f.Ghost))
            return MorphFade.In

        if (this.is(f.Ghost))
            return MorphFade.Out

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
        this.animation.startMorph(MorphFade.In, duration, delay)
    }

    morphOut(duration: number) {
        this.animation.removeAfterMorph = true

        this.animation.startMorph(MorphFade.Out, duration)
    }

    hoverFactor(isBackward: boolean, now: DOMHighResTimeStamp, duration: number) {
        this.hoverChanged = this.hover.step(!isBackward, now, duration, this.isInstant) || this.hoverChanged

        return this.hover.value
    }
}