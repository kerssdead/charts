import GaugeData from '@/types/data/GaugeData'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import Sector from '@/types/Sector'
import { AnimationTiming, COORDS_MAX_X, COORDS_MAX_Y, Layer } from '@/static/constants/Index'
import Point from '@/types/Point'
import Theme from '@/Theme'
import { withAlpha } from '@/helpers/Color'
import { clamp } from '@/helpers/Geometry'
import { stringWidth } from '@/helpers/Text'
import { sum } from '@/helpers/Collections'
import ChartProcess from '@/render/ChartProcess'
import { TextAlignment } from '@/static/Enums'

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

export default class GaugeProcess extends ChartProcess<GaugeData> {
    private readonly lines: Label[][]

    private readonly labelSpace: number

    private readonly innerRatio: number

    private readonly radius: number

    private readonly thickness: number

    private readonly center: Point

    constructor(data: GaugeData, pixel: Point, valuePostfix: string | undefined) {
        super(data, pixel, valuePostfix)

        this.lines = this.getLines()

        const width = this.units.toPxX(COORDS_MAX_X)
        const height = this.units.toPxY(COORDS_MAX_Y)

        this.labelSpace = LABEL_GAP + LABEL_FONT * this.labelRows + LABEL_GAP
        this.innerRatio = clamp(this.data.innerRadius ?? DEFAULT_INNER_RADIUS, 0, 100) / 100
        this.radius = Math.max(Math.min(width / 2 - this.units.toPxX(PADDING), height - this.labelSpace - this.units.toPxY(PADDING) * 2), 0)
        this.thickness = this.radius * (1 - this.innerRatio) / this.data.values.length
        this.center = {
            x: COORDS_MAX_X / 2,
            y: this.units.y((height - this.radius - this.labelSpace) / 2 + this.radius)
        }
    }

    private get min() {
        return this.data.min ?? 0
    }

    private get max() {
        return this.data.max ?? 100
    }

    private get isSingle() {
        return this.data.values.length == 1
    }

    private get band() {
        return this.radius * (1 + this.innerRatio) / 2
    }

    private get labelRows() {
        return this.isSingle ? 2 : this.lines.length + 1
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

        return range == 0 ? 0 : clamp((value - this.min) / range, 0, 1)
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
                 .color(withAlpha(Theme.text, TRACK_ALPHA))
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
        const rows = Array.from({ length: this.labelRows }, (_, index) => this.center.y + this.units.y(LABEL_GAP + LABEL_FONT * (index + .5)))

        return [
            ...this.getRangeLabels(rows[0]),
            ...(this.isSingle ? this.getValueLabels(sector, rows) : this.getLegendLines(rows.slice(1)))
        ]
    }

    private getRangeLabels(y: number) {
        const { x } = this.center
        const band = this.units.x(this.band)

        return [
            this.getText('gauge-min', this.formatValue(this.min), x - band, y, RANGE_FONT),
            this.getText('gauge-max', this.formatValue(this.max), x + band, y, RANGE_FONT)
        ]
    }

    private getLegendLines(rows: number[]) {
        return this.lines.flatMap((line, index) => {
            let left = (this.units.toPxX(COORDS_MAX_X) - sum(line, label => label.width)
                        - LABEL_SPACING * (line.length - 1)) / 2

            return line.flatMap(label => {
                const items = [
                    this.getMarker(label, this.units.x(left + MARKER_RADIUS), rows[index]),
                    this.getText(label.key, label.text,
                        this.units.x(left + MARKER_RADIUS + MARKER_SPACE + (label.width - MARKER_RADIUS - MARKER_SPACE) / 2),
                        rows[index], LABEL_FONT)
                ]

                left += label.width + LABEL_SPACING

                return items
            })
        })
    }

    private getValueLabels(sector: Sector, rows: number[]) {
        const { x, y } = this.center

        const value = this.formatValue(sector.value)
        const rangeWidth = Math.max(stringWidth(this.formatValue(this.min), RANGE_FONT), stringWidth(this.formatValue(this.max), RANGE_FONT))
        const slot = (this.band - rangeWidth / 2 - LABEL_GAP * 2) * 2

        const inner = this.radius * this.innerRatio * 2 * VALUE_PADDING
        const valueFont = Math.min(VALUE_FONT, inner / stringWidth(value, 1))
        const isValueInside = valueFont >= VALUE_MIN_FONT

        const labels = isValueInside
                       ? [this.getText('gauge-value-label', value, x, y - this.units.y(valueFont / 2), valueFont)]
                       : []

        const below = [
            { key: 'gauge-value-label', text: isValueInside ? '' : value },
            { key: 'gauge-label', text: sector.label }
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
                 .position(x, y)
                 .size(size)
                 .align(TextAlignment.Center)
                 .key(key)
                 .init(AnimationTiming.gaugeLabelInit, AnimationTiming.gaugeInit, true)
        }
    }

    private getTooltip(sector: Sector) {
        return this.tooltip(sector.label, `${ this.formatValue(sector.value) } (${ this.percent(this.getRatio(sector.value)) })`)
    }
}