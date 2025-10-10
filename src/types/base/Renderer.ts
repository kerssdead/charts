import { Data } from '../interfaces/Data'
import { Renderable } from './Renderable'
import { Helper } from '../../Helper'
import { Value } from './Value'
import { Legend } from '../../Legend'
import { Dropdown } from '../../Dropdown'
import { DropdownItem } from '../DropdownItem'
import { Point } from '../Point'
import { TextResources } from '../../static/TextResources'
import { Chart } from '../../Chart'
import { Canvas } from '../../helpers/Canvas'
import { TextStyles } from '../../helpers/TextStyles'
import { LegendPlace, RenderState } from '../../static/Enums'
import * as Constants from '../../static/constants/Index'

export class Renderer<T extends Data> extends Renderable {
    dropdown: Dropdown

    data: T

    protected isDestroy: boolean = false

    protected highlightItems: string[]

    constructor(chart: Chart) {
        super(chart)

        this.data = <T>this.settings.data

        this.highlightItems = []

        this.state = this.settings.disableInitAnimation ? RenderState.Idle : RenderState.Init
    }

    render() {
        super.render()

        this.renderTitle()
    }

    destroy() {
        this.isDestroy = true

        this.canvas.remove()
    }

    renderDropdown() {
        this.onClickEvent = this.dropdown?.render(this.onMouseMoveEvent, this.onClickEvent)
    }

    resize() {
        this.#calculateSizes()
        this.tooltip.refresh()
        this.dropdown?.resize()
    }

    prepareSettings() {
        const domRect = this.node.parentElement!.getBoundingClientRect()

        this.settings.minWidth = isNaN(+this.settings.width)
                                 ? 0
                                 : +this.settings.width
        this.settings.minHeight = isNaN(+this.settings.height)
                                  ? 0
                                  : +this.settings.height

        this.settings.width = this.settings.minWidth != 0 && domRect.width < this.settings.minWidth
                              ? this.settings.minWidth
                              : domRect.width

        this.settings.height = this.settings.minHeight != 0 && domRect.height < this.settings.minHeight
                               ? this.settings.minHeight
                               : domRect.height

        this.canvas.width = this.settings.width
        this.canvas.height = this.settings.height

        const baseColor = this.settings.baseColor ?? Helper.randomColor()
        let adjustStep = Math.round(100 / this.settings.data.values.length),
            adjustAmount = -50

        if (adjustStep <= 1)
            adjustStep = 1

        for (let item of this.settings.data.values) {
            item.id = Helper.guid()
            item.color ??= Helper.adjustColor(baseColor, adjustAmount += adjustStep)
            item.label ??= TextResources.NoLabel

            if (item.label.length > 30)
                item.label = item.label.slice(0, 27) + '...'
        }

        for (let item of this.settings.contextMenu ?? [])
            if (item.id != undefined)
                item.action = data => this.node.dispatchEvent(new CustomEvent(item.id ?? '', { detail: data }))
    }

    initDropdown() {
    }

    renderContextMenu(data: any) {
        if (this.dropdown?.isActive) {
            this.onContextMenuEvent = undefined

            return false
        }

        if (this.onContextMenuEvent != undefined && this.settings.contextMenu?.length != 0) {
            if (this.contextMenu == undefined && this.settings.contextMenu != undefined) {
                let clone: DropdownItem[] = []

                for (const item of this.settings.contextMenu)
                    if (!item.condition || item.condition(data))
                        clone.push({
                            id: item.id,
                            text: item.text,
                            isDivider: item.isDivider,
                            action: () => {
                                item.action(data)

                                this.onContextMenuEvent = undefined
                                this.contextMenu = undefined
                            }
                        })

                this.contextMenu = new Dropdown(this.canvas, {
                    x: this.onContextMenuEvent.x - this.canvasPosition.x,
                    y: this.onContextMenuEvent.y - this.canvasPosition.y,
                    items: clone,
                    data: data
                })

                this.contextMenu.resize()

                this.onClickEvent = undefined
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

    highlight(value?: Value) {
        if (value)
            this.highlightItems = [value.id]
        else
            this.highlightItems = []
    }

    closeDropdowns() {
        this.dropdown?.close()
        this.onContextMenuEvent = undefined
    }

    protected renderTitle() {
        const ctx = Canvas.getContext(this.canvas)

        if (this.settings.title) {
            TextStyles.title(ctx)
            ctx.fillText(this.settings.title, this.canvas.width / 2, Constants.Values.titleOffset)
        }
    }

    #calculateSizes() {
        let domRect = this.node.getBoundingClientRect()

        this.settings.width = this.settings.minWidth && domRect.width < this.settings.minWidth
                              ? this.settings.minWidth
                              : domRect.width
        this.settings.height = this.settings.minHeight && domRect.height < this.settings.minHeight
                               ? this.settings.minHeight
                               : domRect.height

        this.canvas.width = this.settings.width
        this.canvas.height = this.settings.height

        if (this.settings.enableLegend) {
            if (this.settings.legendPlace == undefined
                || this.settings.legendPlace == LegendPlace.Top
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