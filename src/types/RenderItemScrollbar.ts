import RenderItemBase from '@/types/interfaces/RenderItemBase'
import Panel from '@/types/Panel'
import RenderItem from '@/types/RenderItem'
import RectangleDimensions from '@/types/RectangleDimensions'
import { ThemePalette } from '@/Theme'
import { withAlpha } from '@/helpers/Color'

const ALPHA = .3

export default class RenderItemScrollbar extends RenderItemBase {
    private readonly panel: Panel

    private thumb: RectangleDimensions | null = null

    constructor(panel: Panel) {
        super()

        this.panel = panel
    }

    defaultColor(theme: ThemePalette): string {
        return withAlpha(theme.text, ALPHA)
    }

    adjust(): void {
        this.thumb = this.panel.thumb
    }

    canBeCached(): boolean {
        return false
    }

    render(ctx: CanvasRenderingContext2D, _item: RenderItem): void {
        if (!this.thumb)
            return

        const { x, y, width, height } = this.thumb

        ctx.roundRect(x, y, width, height, width / 2)
        ctx.fill()
    }

    getBounds() {
        if (!this.thumb)
            return null

        const { x, y, width, height } = this.thumb

        return { left: x, top: y, right: x + width, bottom: y + height }
    }
}