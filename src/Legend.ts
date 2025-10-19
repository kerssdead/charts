import { Value } from 'types/base/Value'
import { Renderable } from 'types/base/Renderable'
import * as Helper from 'Helper'
import { Sector } from 'types/Sector'
import { Point } from 'types/Point'
import { Theme } from 'Theme'
import { Chart } from 'Chart'
import { TextStyles } from 'helpers/TextStyles'
import { Canvas } from 'helpers/Canvas'
import { Button } from 'Button'
import { TextResources } from 'static/TextResources'
import * as Constants from 'static/constants/Index'
import { Styles } from 'static/constants/Styles'
import { AnimationType, Events, LegendPlace, RenderState } from 'static/Enums'
import { ChartSettings } from './types/ChartSettings'

export class Legend extends Renderable {
    #button: Button

    #offset: Point

    #chart: Chart

    #hoverCount: number

    isDestroy: boolean = false

    constructor(chart: Chart) {
        super(chart)

        this.#chart = chart

        this.prepareSettings()
    }

    render() {
        super.render()

        const ctx = Canvas.getContext(this.canvas)

        let nextPoint = { x: 20, y: 21 }

        this.canvas.style.cursor = Styles.Cursor.Default

        TextStyles.regular(ctx)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'

        ctx.translate(this.#offset.x, this.#offset.y)

        this.#hoverCount = 0

        for (const value of this.settings.data.values.filter(v => !v.hideInLegend))
            nextPoint = this.#draw(value, nextPoint.x, nextPoint.y)

        ctx.translate(-this.#offset.x, -this.#offset.y)

        if (!this.isDestroy)
            requestAnimationFrame(this.render.bind(this))

        this.onClickEvent = this.#button?.render(this.onMouseMoveEvent, this.onClickEvent)

        this.state = RenderState.Idle
    }

    #draw(value: Value, x: number, y: number): Point {
        const ctx = Canvas.getContext(this.canvas)

        const textWidth = Helper.stringWidth(value.label),
            circleRadius = 6

        if (x + 48 + textWidth >= this.canvas.width - 40 - this.#offset.x) {
            x = 20
            y += 26
        }

        let rectX = x - circleRadius - circleRadius,
            rectY = y - circleRadius / 2 - circleRadius,
            rectW = circleRadius + circleRadius + textWidth + 18,
            rectH = 20

        const isHover = (event: MouseEvent | undefined) => {
            if (!event)
                return false

            const px = event.clientX - this.canvasPosition.x + scrollX - this.#offset.x,
                py = event.clientY - this.canvasPosition.y + scrollY - this.#offset.y

            return px >= rectX && px <= rectX + rectW
                   && py >= rectY && py <= rectY + rectH
        }

        const translate = (transition: number, event: AnimationType) => {
            this.animations.reload(value.id, event)

            ctx.beginPath()

            ctx.roundRect(rectX, rectY, rectW, rectH, circleRadius)

            ctx.fillStyle = Helper.adjustColor(Theme.canvasBackground, Math.round(-25 * transition))
            ctx.fill()
        }

        this.animations.add(value.id,
            AnimationType.Click,
            {
                duration: Constants.Animations.legend,
                continuous: true,
                before: () => {
                    return this.onClickEvent != undefined
                           && (isHover(this.onClickEvent)
                               || (value instanceof Sector
                                   && value.current !== 0
                                   && value.value !== value.current))
                           && value.checkCondition()
                },
                body: transition => {
                    value.toggle(transition)

                    if (transition == 1)
                        this.onClickEvent = new PointerEvent(Events.Click)
                }
            })

        if (isHover(this.onMouseMoveEvent)) {
            this.animations.add(value.id,
                AnimationType.MouseOver,
                {
                    duration: Constants.Animations.button,
                    body: transition => {
                        translate(transition, AnimationType.MouseLeave)
                    }
                })

            if (!value.disabled) {
                this.#hoverCount++

                this.#chart.highlight(value)
            }

            this.canvas.style.cursor = Styles.Cursor.Pointer
        } else {
            this.animations.add(value.id,
                AnimationType.MouseLeave,
                {
                    timer: Constants.Dates.minDate,
                    duration: Constants.Animations.button,
                    backward: true,
                    body: transition => {
                        translate(transition, AnimationType.MouseOver)
                    }
                })
        }

        ctx.beginPath()

        ctx.arc(x - 1, y + 1, 3, 0, 2 * Math.PI)
        ctx.fillStyle = value.disabled ? Helper.grayScale(value.color) : value.color
        ctx.fill()

        ctx.fillStyle = Theme.text
        if (value.disabled)
            ctx.fillStyle += '7f'

        ctx.fillText(value.label, x + circleRadius * 1.5 + 1, y + 6)

        x += 20

        if (value.disabled) {
            ctx.moveTo(x - 10, y + 2)
            ctx.lineTo(x + textWidth - 10, y + 2)
            ctx.strokeStyle = Theme.text + '7f'
            ctx.stroke()
        }

        x += textWidth + 22

        return {
            x: x,
            y: y
        }
    }

    destroy() {
        this.isDestroy = true

        this.canvas.remove()
    }

    refresh() {
        this.state = RenderState.Init
    }

    resize() {
        this.calculateSizes()
        this.#button?.resize()
        this.initAnimations()
    }

    calculateSizes() {
        switch (this.settings.legendPlace) {
            case LegendPlace.Bottom:
            default:
                this.canvas.width = this.settings.width
                this.canvas.height = Legend.getLegendHeight(this.settings.data.values, this.canvas.width)

                this.node.style.flexDirection = Styles.FlexDirection.Column

                break

            case LegendPlace.Top:
                this.canvas.width = this.settings.width
                this.canvas.height = Legend.getLegendHeight(this.settings.data.values, this.canvas.width)

                this.node.style.flexDirection = Styles.FlexDirection.ColumnReverse

                break

            case LegendPlace.Left:
                this.canvas.width = 500
                this.canvas.height = this.settings.height

                this.node.style.flexDirection = Styles.FlexDirection.Row

                break

            case LegendPlace.Right:
                this.canvas.width = 500
                this.canvas.height = this.settings.height

                this.node.style.flexDirection = Styles.FlexDirection.RowReverse

                break
        }

        this.#offset = {
            x: Legend.getOffsetToCenter(this.settings.data.values, this.canvas.width),
            y: (this.canvas.height - Legend.getLegendHeight(this.settings.data.values, this.canvas.width)) / 2
        }
    }

    applySettings(settings: ChartSettings) {
        this.settings = settings

        this.prepareSettings()
    }

    prepareSettings() {
        this.calculateSizes()

        if (!this.settings.disableInteractions)
            this.#button = new Button(this.canvas,
                {
                    x: -10,
                    y: 12,
                    text: TextResources.reset,
                    action: () => {
                        for (let value of this.settings.data.values)
                            value.reset()
                    }
                })
    }

    static getOffsetToCenter(values: Value[], width: number): number {
        let maxWidth = 20

        for (const value of values.filter(v => !v.hideInLegend)) {
            const labelWidth = Helper.stringWidth(value.label)

            if (maxWidth + labelWidth + 47 >= width - 100)
                break

            maxWidth += labelWidth + 47
        }

        return width / 2 - maxWidth / 2
    }

    static getLegendHeight(values: Value[], width: number): number {
        let count = 1,
            acc = 20,
            offset = Legend.getOffsetToCenter(values, width)

        for (const value of values.filter(v => !v.hideInLegend)) {
            const labelWidth = Helper.stringWidth(value.label)

            if (acc + labelWidth + 48 >= width - 32 - offset) {
                acc = 20
                count++
            }

            acc += labelWidth + 48
        }

        return 24 + count * 20 + (count - 1) * 6
    }
}