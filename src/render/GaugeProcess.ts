import GaugeData from '@/types/data/GaugeData'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import Sector from '@/types/Sector'
import { AnimationTiming, COORDS_MAX_X, COORDS_MAX_Y, Layer } from '@/static/constants/Index'
import Point from '@/types/Point'
import ChartSettings from '@/types/ChartSettings'
import Formatter from '@/helpers/Formatter'
import Theme from '@/Theme'
import { stringWidth, sum } from '@/Helper'
import Units from '@/helpers/Units'
import { PlotAxisType, TextAlignment } from '@/static/Enums'

const PADDING = 80

const LABEL_FONT = 16

const RANGE_FONT = 14

const LABEL_GAP = 8

const LABEL_SPACING = 16

const MARKER_RADIUS = 3

const MARKER_SPACE = 11

const VALUE_FONT = 32

const VALUE_MIN_FONT = 12

const VALUE_PADDING = .8

const DEFAULT_INNER_RADIUS = 70

const GAP = 20

const CORNER_RADIUS = 30

const TRACK_ALPHA = .15

const START_ANGLE = Math.PI

const SWEEP = Math.PI

type Label = {
    key: string
    text: string
    color: string
    width: number
}

export default class GaugeProcess {
    private data: GaugeData

    private readonly units: Units

    private readonly valuePostfix: string | undefined

    private readonly lines: Label[][]

    constructor(data: GaugeData, pixel: Point, settings: ChartSettings) {
        this.data = data
        this.units = new Units(pixel)
        this.valuePostfix = settings.valuePostfix
        this.lines = this.getLines()
    }

    private get min() {
        return this.data.min ?? 0
    }

    private get max() {
        return this.data.max ?? 100
    }

    private get radius() {
        const width = this.units.toPxX(COORDS_MAX_X)
        const height = this.units.toPxY(COORDS_MAX_Y)

        return Math.max(Math.min(width / 2 - this.units.toPxX(PADDING), height - this.labelSpace - this.units.toPxY(PADDING) * 2), 0)
    }

    private get isSingle() {
        return this.data.values.length == 1
    }

    private get labelRows() {
        return this.isSingle ? 2 : this.lines.length + 1
    }

    private get labelSpace() {
        return LABEL_GAP + LABEL_FONT * this.labelRows + LABEL_GAP
    }

    private get thickness() {
        return this.radius * (1 - this.innerRatio) / this.data.values.length
    }

    private get innerRatio() {
        return Math.min(Math.max(this.data.innerRadius ?? DEFAULT_INNER_RADIUS, 0), 100) / 100
    }

    private get center(): Point {
        const height = this.units.toPxY(COORDS_MAX_Y)
        const top = (height - this.radius - this.labelSpace) / 2

        return {
            x: COORDS_MAX_X / 2,
            y: this.units.y(top + this.radius)
        }
    }

    getData() {
        const first = this.data.values[0]

        if (!first || this.radius <= 0)
            return []

        return [
            ...this.data.values.flatMap((sector, index) => [
                this.getTrack(index),
                this.getValue(sector, index)
            ]),
            ...this.getLabels(first)
        ]
    }

    private getRing(index: number) {
        const radius = this.radius - this.thickness * index

        return {
            radius: this.units.x(radius),
            innerRadius: this.units.x(radius - this.thickness)
        }
    }

    private getRatio(value: number) {
        const range = this.max - this.min

        return range == 0 ? 0 : Math.min(Math.max((value - this.min) / range, 0), 1)
    }

    private getTrack(index: number) {
        if (!this.data.enableTrack)
            return QueueItemsBuilder.empty

        const { radius, innerRadius } = this.getRing(index)

        return (items: QueueItemsBuilder) => {
            items.arc()
                 .position(this.center.x, this.center.y)
                 .startAngle(START_ANGLE)
                 .endAngle(START_ANGLE + SWEEP)
                 .radius(radius)
                 .innerRadius(innerRadius)
                 .gap(GAP)
                 .cornerRadius(CORNER_RADIUS)
                 .fill()
                 .gradient()
                 .color(Theme.withAlpha(Theme.text, TRACK_ALPHA))
                 .layer(Layer.Base)
                 .key(`gauge-track-${ index }`)
                 .init(AnimationTiming.gaugeInit, 0, true)
        }
    }

    private getValue(sector: Sector, index: number) {
        const { radius, innerRadius } = this.getRing(index)

        return (items: QueueItemsBuilder) => {
            items.arc()
                 .position(this.center.x, this.center.y)
                 .startAngle(START_ANGLE)
                 .endAngle(START_ANGLE + SWEEP * this.getRatio(sector.value))
                 .radius(radius)
                 .innerRadius(innerRadius)
                 .gap(GAP)
                 .cornerRadius(CORNER_RADIUS)
                 .grow(START_ANGLE)
                 .fill()
                 .gradient()
                 .color(sector.color)
                 .layer(Layer.Data)
                 .key(`gauge-value-${ index }`)
                 .init(AnimationTiming.gaugeInit)
                 .tooltip(this.getTooltip(sector))
                 .data(sector.data)
                 .contextMenu()
        }
    }

    private getLabels(sector: Sector) {
        const { x, y } = this.center

        const band = this.radius * (1 + this.innerRatio) / 2
        const rows = Array.from({ length: this.labelRows }, (_, index) => y + this.units.y(LABEL_GAP + LABEL_FONT * (index + .5)))

        const min = this.formatValue(this.min)
        const max = this.formatValue(this.max)
        const value = this.formatValue(sector.value)

        const slot = (band - Math.max(stringWidth(min, RANGE_FONT), stringWidth(max, RANGE_FONT)) / 2 - LABEL_GAP * 2) * 2

        const inner = this.radius * this.innerRatio * 2 * VALUE_PADDING
        const valueFont = Math.min(VALUE_FONT, inner / stringWidth(value, 1))
        const isValueInside = this.isSingle && valueFont >= VALUE_MIN_FONT

        const labels = [
            this.getText('gauge-min', min, x - this.units.x(band), rows[0], RANGE_FONT),
            this.getText('gauge-max', max, x + this.units.x(band), rows[0], RANGE_FONT)
        ]

        if (isValueInside)
            labels.push(this.getText('gauge-value-label', value, x, y - this.units.y(valueFont / 2), valueFont))

        if (!this.isSingle) {
            this.lines.forEach((line, index) => {
                let left = (this.units.toPxX(COORDS_MAX_X) - sum(line, label => label.width)
                            - LABEL_SPACING * (line.length - 1)) / 2

                for (const label of line) {
                    labels.push(this.getMarker(label, this.units.x(left + MARKER_RADIUS), rows[index + 1]))
                    labels.push(this.getText(label.key, label.text,
                        this.units.x(left + MARKER_RADIUS + MARKER_SPACE + (label.width - MARKER_RADIUS - MARKER_SPACE) / 2),
                        rows[index + 1], LABEL_FONT))

                    left += label.width + LABEL_SPACING
                }
            })

            return labels
        }

        const below = [
            { key: 'gauge-value-label', text: isValueInside ? '' : value },
            { key: 'gauge-label', text: sector.label ?? '' }
        ].filter(label => label.text)

        let row = 0

        for (const label of below) {
            if (row == 0 && stringWidth(label.text, LABEL_FONT) > slot)
                row++

            if (row >= rows.length)
                break

            labels.push(this.getText(label.key, label.text, x, rows[row++], LABEL_FONT))
        }

        return labels
    }

    private getLines() {
        const available = this.units.toPxX(COORDS_MAX_X) - this.units.toPxX(PADDING) * 2

        const lines: Label[][] = []

        let width = 0

        this.data.values.forEach((item, index) => {
            const text = `${ item.label }: ${ this.formatValue(item.value) }`
            const label = {
                key: `gauge-label-${ index }`,
                text,
                color: item.color,
                width: MARKER_RADIUS + MARKER_SPACE + stringWidth(text, LABEL_FONT)
            }

            const line = lines[lines.length - 1]

            if (line && width + LABEL_SPACING + label.width <= available) {
                line.push(label)
                width += LABEL_SPACING + label.width
            } else {
                lines.push([label])
                width = label.width
            }
        })

        return lines
    }

    private getMarker(label: Label, x: number, y: number) {
        return (items: QueueItemsBuilder) => {
            items.arc()
                 .position(x, y)
                 .radius(this.units.x(MARKER_RADIUS))
                 .fill()
                 .color(label.color)
                 .key(`${ label.key }-marker`)
                 .init(AnimationTiming.gaugeLabelInit, AnimationTiming.gaugeInit, true)
        }
    }

    private getText(key: string, value: string, x: number, y: number, size: number) {
        return (items: QueueItemsBuilder) => {
            items.text(value)
                 .position(x + this.units.x(size / 2), y)
                 .size(size)
                 .align(TextAlignment.Center)
                 .key(key)
                 .init(AnimationTiming.gaugeLabelInit, AnimationTiming.gaugeInit, true)
        }
    }

    private getTooltip(sector: Sector) {
        const rows = [sector.label, `${ this.formatValue(sector.value) } (${ this.getPercent(sector.value) })`]

        return rows.filter(row => row).join('\n')
    }

    private formatValue(value: number) {
        return Formatter.format(value, PlotAxisType.Number, this.valuePostfix)
    }

    private getPercent(value: number) {
        return `${ +(this.getRatio(value) * 100).toFixed(1) }%`
    }
}