import CanvasWindow from '@/types/CanvasWindow'
import RenderItemBase from '@/types/interfaces/RenderItemBase'
import RenderItem from '@/types/RenderItem'
import LeaderOrigin from '@/types/interfaces/LeaderOrigin'
import LeaderTarget from '@/types/interfaces/LeaderTarget'
import { ThemePalette } from '@/Theme'
import { clamp, lerp } from '@/helpers/Geometry'

type LeaderAngles = {
    offset: number
    anchor: number
}

type LeaderCanvas = LeaderAngles & {
    gap: number
    length: number
}

export default class RenderItemLeaderLine extends RenderItemBase {
    target: LeaderTarget | null = null

    targetItem: RenderItem | null = null

    gap = 0

    length = 0

    offset = 0

    anchor = 0

    from: LeaderAngles | null = null

    private window!: CanvasWindow

    private canvas: LeaderCanvas = { gap: 0, length: 0, offset: 0, anchor: 0 }

    constructor(readonly origin: LeaderOrigin, readonly originItem: RenderItem) {
        super()
    }

    defaultColor(theme: ThemePalette) {
        return theme.line
    }

    current(morph = 1): LeaderAngles {
        if (!this.from || morph >= 1)
            return { offset: this.offset, anchor: this.anchor }

        return {
            offset: lerp(this.from.offset, this.offset, morph),
            anchor: lerp(this.from.anchor, this.anchor, morph)
        }
    }

    morphFrom(previous: RenderItemBase, morph: number) {
        if (!(previous instanceof RenderItemLeaderLine))
            return false

        this.from = previous.current(morph)

        return true
    }

    adjust(window: CanvasWindow, morph = 1) {
        this.window = window

        this.canvas = {
            ...this.current(morph),
            gap: window.scaleX(this.gap),
            length: window.scaleX(this.length)
        }
    }

    getDependencies(): RenderItemBase[] {
        return this.targetItem ? [this.originItem.shape, this.targetItem.shape] : [this.originItem.shape]
    }

    render(ctx: CanvasRenderingContext2D) {
        const target = this.target
        const targetItem = this.targetItem
        const visibility = targetItem?.animation.visibility ?? 0

        if (!target || !targetItem || visibility <= 0)
            return

        const { x, y, angle, distance, lift } = this.origin.leaderOrigin()
        const anchorAngle = angle + this.canvas.anchor
        const turn = this.canvas.offset - this.canvas.anchor
        const targetAngle = anchorAngle + turn

        const start = distance + this.canvas.gap
        const end = start + this.canvas.length
        const liftedStart = start + lift
        const handle = 4 / 3 * Math.tan(turn / 4) * end

        ctx.globalAlpha *= this.originItem.animation.visibility * visibility

        const endX = x + end * Math.cos(targetAngle)
        const endY = y + end * Math.sin(targetAngle)

        const box = target.leaderBox(this.window, targetItem.animation.morph)

        ctx.beginPath()
        ctx.moveTo(x + liftedStart * Math.cos(anchorAngle), y + liftedStart * Math.sin(anchorAngle))
        ctx.bezierCurveTo(
            x + end * Math.cos(anchorAngle) - handle * Math.sin(anchorAngle),
            y + end * Math.sin(anchorAngle) + handle * Math.cos(anchorAngle),
            endX + handle * Math.sin(targetAngle),
            endY - handle * Math.cos(targetAngle),
            clamp(endX, box.x - box.halfWidth, box.x + box.halfWidth),
            clamp(endY, box.y - box.halfHeight, box.y + box.halfHeight)
        )
        ctx.stroke()
    }
}