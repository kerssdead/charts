///<reference path="Renderable.ts"/>
class Renderer<T extends Data> extends Renderable {
    dropdown: Dropdown

    data: T

    constructor(node: HTMLElement, settings: ChartSettings) {
        super(node, settings)

        this.data = <T>settings.data

        this.#calculateSizes()
    }

    render() {
        super.render()

        const ctx = Helpers.Canvas.getContext(this.canvas)

        if (this.settings.title) {
            Helpers.TextStyles.title(ctx)
            ctx.fillText(this.settings.title, this.canvas.width / 2, 40)
        }

        this.onClickEvent = this.dropdown?.render(this.onMouseMoveEvent, this.onClickEvent)
    }

    resize() {
        this.tooltip.refresh()
        this.#calculateSizes()
    }

    prepareSettings() {
        const dimension = this.node.parentElement!.getBoundingClientRect()

        if (!this.settings.width || +this.settings.width == 0)
            this.settings.width = dimension.width
        if (!this.settings.height || +this.settings.height == 0)
            this.settings.height = dimension.height

        const baseColor = this.settings.baseColor ?? Helper.randomColor()
        let adjustStep = Math.round(100 / this.settings.data.values.length),
            adjustAmount = -50

        if (adjustStep <= 1)
            adjustStep = 1

        for (let item of this.settings.data.values) {
            item.id = Helper.guid()
            item.color ??= Helper.adjustColor(baseColor, adjustAmount += adjustStep)
        }
    }

    #calculateSizes() {
        let domRect = this.node.getBoundingClientRect()

        this.canvas.width = this.settings.width < domRect.width || domRect.width == 0
            ? this.settings.width
            : domRect.width
        this.canvas.height = this.settings.height < domRect.height || domRect.height == 0
            ? this.settings.height
            : domRect.height

        if (this.settings.enableLegend) {
            if (this.settings.legendPlace == LegendPlace.Top
                || this.settings.legendPlace == LegendPlace.Bottom)
                this.canvas.height -= Legend.getLegendHeight(this.settings.data.values, this.canvas.width)

            if (this.settings.legendPlace == LegendPlace.Left
                || this.settings.legendPlace == LegendPlace.Right)
                this.canvas.width -= 500
        }
    }
}