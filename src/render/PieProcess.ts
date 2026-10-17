import PieData from "types/data/PieData"
import QueueItemsBuilder from "builders/QueueItemsBuilder"
import Sector from "types/Sector"
import { Animations, COORDS_MAX_X, COORDS_MAX_Y } from "static/constants/Index"
import Point from "types/Point"
import TextResources from "static/TextResources"
import { boxEdgeDistance, stringWidth } from "Helper"
import Formatter from "helpers/Formatter"
import ChartSettings from "types/ChartSettings"
import { PlotAxisType, TextAlignment } from "static/Enums"

const LEADER_GAP = 4

const LEADER_LENGTH = 12

const LABEL_SPACING = 2

const LABEL_STEP = .005

const LABEL_ITERATIONS = 500

const LABEL_MAX_DRIFT = Math.PI / 6

const LABEL_SPACE = 36

const LABEL_FONT = 14

const SECTOR_GAP = 4

const SECTOR_CORNER_RADIUS = 6

const MIN_SECTOR_WIDTH = SECTOR_GAP + SECTOR_CORNER_RADIUS * 2

const OTHER_KEY = 'other'

const OTHER_COLOR = '#9e9e9e'

const INNER_TITLE_FONT = 16

const INNER_TITLE_MIN_FONT = 10

const INNER_TITLE_PADDING = .8

const START_ANGLE = 0

const FULL_ANGLE = Math.PI * 2

type Slice = {
    sector: Sector
    key: string
    children?: Sector[]
    startAngle: number
    angle: number
}

type Label = {
    angle: number
    isVisible: boolean
}

export default class PieProcess {
    private data: PieData

    private readonly pixel: Point

    private readonly enableOther: boolean

    private readonly valuePostfix: string | undefined

    private scale: number = 0

    private sum: number = 0

    constructor(data: PieData, pixel: Point, settings: ChartSettings) {
        this.data = data
        this.pixel = pixel
        this.enableOther = settings.enableOther
        this.valuePostfix = settings.valuePostfix
    }

    private get radius() {
        const width = COORDS_MAX_X / this.pixel.x
        const height = COORDS_MAX_Y / this.pixel.y

        return Math.max(Math.min(width / 5, height / 2 - LABEL_SPACE), 0)
    }

    private get innerRatio() {
        return Math.min(Math.max(this.data.innerRadius ?? 0, 0), 100) / 100
    }

    private get labelDistance() {
        return this.radius + LEADER_GAP + LEADER_LENGTH + LEADER_GAP
    }

    getData() {
        this.sum = this.data.values.filter(s => !s.disabled).sumByField(s => s.value)
        this.scale = this.sum == 0 ? 0 : FULL_ANGLE / this.sum

        const slices = this.getSlices()
        const labels = this.getLabels(slices)

        return [
            ...slices.map((slice, index) => this.getSector(slice, labels[index])),
            this.getInnerTitle()
        ]
    }

    private getSlices(): Slice[] {
        let acc = START_ANGLE

        return this.groupTiny().map(({ sector, key, children }) => {
            const angle = sector.disabled ? 0 : sector.value * this.scale
            const slice = { sector, key, children, startAngle: acc, angle }

            acc += angle

            return slice
        })
    }

    private getLabels(slices: Slice[]): Label[] {
        const result: Label[] = slices.map(slice => ({ angle: slice.startAngle + slice.angle / 2, isVisible: true }))

        const center = {
            x: COORDS_MAX_X / 2 / this.pixel.x,
            y: COORDS_MAX_Y / 2 / this.pixel.y
        }

        const distance = this.labelDistance

        const labels = slices.flatMap((slice, index) => {
            if (slice.sector.disabled)
                return []

            const middle = result[index].angle

            return [{
                index,
                middle,
                angle: middle,
                value: slice.sector.value,
                halfWidth: stringWidth(slice.sector.label, LABEL_FONT) / 2,
                halfHeight: LABEL_FONT / 2
            }]
        }).sort((a, b) => a.middle - b.middle)

        type Box = typeof labels[number]

        const getCenter = (label: Box, angle: number) => {
            const push = distance + boxEdgeDistance(angle, label.halfWidth, label.halfHeight)

            return {
                x: center.x + push * Math.cos(angle),
                y: center.y + push * Math.sin(angle)
            }
        }

        const isOverlap = (a: Box, aAngle: number, b: Box, bAngle: number) => {
            const first = getCenter(a, aAngle)
            const second = getCenter(b, bAngle)

            return Math.abs(first.x - second.x) < a.halfWidth + b.halfWidth + LABEL_SPACING
                   && Math.abs(first.y - second.y) < a.halfHeight + b.halfHeight + LABEL_SPACING
        }

        const clamp = (label: Box) => {
            label.angle = Math.min(Math.max(label.angle, label.middle - LABEL_MAX_DRIFT), label.middle + LABEL_MAX_DRIFT)
        }

        for (let iteration = 0; iteration < LABEL_ITERATIONS; iteration++) {
            let isMoved = false

            for (let i = 0; i < labels.length; i++) {
                const isLast = i == labels.length - 1

                if (isLast && labels.length < 3)
                    break

                const current = labels[i]
                const next = labels[isLast ? 0 : i + 1]
                const nextAngle = next.angle + (isLast ? FULL_ANGLE : 0)

                if (!isOverlap(current, current.angle, next, nextAngle))
                    continue

                current.angle -= LABEL_STEP
                next.angle += LABEL_STEP

                clamp(current)
                clamp(next)

                isMoved = true
            }

            if (!isMoved)
                break
        }

        const kept: Box[] = []

        for (const label of [...labels].sort((a, b) => b.value - a.value)) {
            const isVisible = kept.every(other => !isOverlap(label, label.angle, other, other.angle))

            if (isVisible)
                kept.push(label)

            result[label.index] = { angle: label.angle, isVisible }
        }

        return result
    }

    private getInnerTitle() {
        const title = this.data.innerTitle

        if (!title)
            return QueueItemsBuilder.empty

        const available = this.radius * this.innerRatio * 2 * INNER_TITLE_PADDING
        const fontSize = Math.min(INNER_TITLE_FONT, available / stringWidth(title, 1))

        if (fontSize < INNER_TITLE_MIN_FONT)
            return QueueItemsBuilder.empty

        return (items: QueueItemsBuilder) => {
            items.text(title)
                 .position(COORDS_MAX_X / 2 + fontSize / 2 * this.pixel.x, COORDS_MAX_Y / 2)
                 .size(fontSize)
                 .align(TextAlignment.Center)
                 .key('inner-title')
                 .init(Animations.pieInit, 0, true)
        }
    }

    private groupTiny() {
        const items: Omit<Slice, 'startAngle' | 'angle'>[]
            = this.data.values.map((sector, index) => ({ sector, key: index.toString() }))

        if (!this.enableOther)
            return items

        const tiny = this.data.values.filter(sector => {
            return !sector.disabled && sector.value * this.scale * this.radius < MIN_SECTOR_WIDTH
        })

        if (tiny.length < 2)
            return items

        const other = new Sector({
            label: TextResources.other,
            value: tiny.sumByField(s => s.value),
            color: OTHER_COLOR
        })

        return [
            ...items.filter(item => !tiny.includes(item.sector)),
            { sector: other, key: OTHER_KEY, children: tiny }
        ]
    }

    private getSector({ sector, key, children, startAngle, angle }: Slice, label: Label) {
        const endAngle = startAngle + angle
        const labelOffset = label.angle - (startAngle + angle / 2)

        const center = {
            x: COORDS_MAX_X / 2,
            y: COORDS_MAX_Y / 2
        }

        const radius = this.radius * this.pixel.x
        const innerRadius = radius * this.innerRatio

        const orbit = {
            ...center,
            radiusX: this.labelDistance * this.pixel.x,
            radiusY: this.labelDistance * this.pixel.y
        }

        return (items: QueueItemsBuilder) => {
            const arc = items.arc()
                .position(center.x, center.y)
                .startAngle(startAngle)
                .endAngle(endAngle)
                .radius(radius)
                .innerRadius(innerRadius)
                .gap(SECTOR_GAP * this.pixel.x)
                .cornerRadius(SECTOR_CORNER_RADIUS * this.pixel.x)
                .grow(START_ANGLE)
                .leader(LEADER_GAP * this.pixel.x, LEADER_LENGTH * this.pixel.x, labelOffset)
                .fill()
                .gradient()
                .color(sector.color)
                .key(`sector-${ key }`)
                .init(Animations.pieInit)
                .interact()
                .tooltip(this.getTooltip(sector, children))
                .data(sector.data)
                .contextMenu()

            const sectorItem = arc.dispose()

            if (sector.disabled)
                arc.ghost()

            if (!label.isVisible)
                return

            const text = items.text(sector.label)
                .orbit(label.angle, orbit)
                .size(LABEL_FONT)
                .follow(sectorItem.arc)
                .key(`sector-label-${ key }`)
                .init(Animations.pieLabelInit, Animations.pieInit, true)

            sectorItem.arc.leaderLabel = text.dispose()

            if (sector.disabled)
                text.ghost()
        }
    }

    private getTooltip(sector: Sector, children?: Sector[]) {
        const rows = [sector.label, `${ this.formatValue(sector.value) } (${ this.getPercent(sector.value) })`]

        for (const child of children ?? [])
            rows.push(`${ child.label }: ${ this.formatValue(child.value) } (${ this.getPercent(child.value) })`)

        return rows.join('\n')
    }

    private formatValue(value: number) {
        return Formatter.format(value, PlotAxisType.Number, this.valuePostfix)
    }

    private getPercent(value: number) {
        return this.sum == 0 ? '0%' : `${ +(value / this.sum * 100).toFixed(1) }%`
    }
}