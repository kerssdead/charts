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
            ctx.fillText(this.settings.title, this.canvas.width / 2, Constants.Values.titleOffset)
        }
    }

    renderDropdown() {
        this.onClickEvent = this.dropdown?.render(this.onMouseMoveEvent, this.onClickEvent)
    }

    resize() {
        this.#calculateSizes()
        this.tooltip.refresh()
    }

    prepareSettings() {
        const dimension = this.node.parentElement!.getBoundingClientRect()

        this.settings.maxWidth = this.settings.width ?? dimension.width
        this.settings.maxHeight = this.settings.height ?? dimension.height

        if (+this.settings.width == 0)
            this.settings.width = dimension.width > this.settings.maxWidth && +this.settings.maxWidth != 0
                ? this.settings.maxWidth
                : dimension.width
        if (+this.settings.height == 0)
            this.settings.height = dimension.height > this.settings.maxHeight && +this.settings.maxHeight != 0
                ? this.settings.maxHeight
                : dimension.height

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

    renderContextMenu(data: any) {
        if (this.onContextMenuEvent != undefined && this.settings.contextMenu?.length != 0) {
            if (this.contextMenu == undefined && this.settings.contextMenu != undefined) {
                let clone: DropdownItem[] = []

                for (const item of this.settings.contextMenu)
                    clone.push({
                        text: item.text,
                        action: () => {
                            item.action(data)

                            this.onContextMenuEvent = undefined
                            this.contextMenu = undefined
                        }
                    })

                this.contextMenu = new Dropdown(this.canvas, {
                    x: this.onContextMenuEvent.x,
                    y: this.onContextMenuEvent.y,
                    items: clone,
                    data: data
                })
            }

            const isClick = this.onClickEvent != undefined

            this.onClickEvent = this.contextMenu?.render(this.onMouseMoveEvent, this.onClickEvent)

            if (this.onClickEvent == undefined && isClick) {
                this.contextMenu = undefined
                this.onContextMenuEvent = undefined

                return true
            }
        }

        return false
    }

    #calculateSizes() {
        let domRect = this.node.getBoundingClientRect()

        this.canvas.width = this.settings.maxWidth ?? domRect.width
        this.canvas.height = this.settings.maxHeight ?? domRect.height

        if (this.settings.enableLegend) {
            if (this.settings.legendPlace == LegendPlace.Top
                || this.settings.legendPlace == LegendPlace.Bottom)
                this.canvas.height -= Legend.getLegendHeight(this.settings.data.values, this.canvas.width)

            if (this.settings.legendPlace == LegendPlace.Left
                || this.settings.legendPlace == LegendPlace.Right)
                this.canvas.width -= 500
        }
    }

    protected getMousePosition(event: MouseEvent): Point {
        return {
            x: event.clientX - this.canvasPosition.x + scrollX,
            y: event.clientY - this.canvasPosition.y + scrollY
        }
    }
}