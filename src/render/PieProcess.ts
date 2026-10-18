import PieData from '@/types/data/PieData'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import Sector from '@/types/Sector'
import { AnimationTiming, COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'
import Point from '@/types/Point'
import TextResources from '@/static/TextResources'
import { boxEdgeDistance, stringWidth, sum } from '@/Helper'
import Formatter from '@/helpers/Formatter'
import ChartSettings from '@/types/ChartSettings'
import Units from '@/helpers/Units'
import { PlotAxisType, TextAlignment } from '@/static/Enums'

const LEADER_GAP = 20

const LEADER_LENGTH = 60

const LABEL_SPACING = 2

const LABEL_STEP = .005

const LABEL_ITERATIONS = 500

const LABEL_MAX_DRIFT = Math.PI / 6

const LABEL_SPACE = 36

const LABEL_FONT = 14

const SECTOR_GAP = 20

const SECTOR_CORNER_RADIUS = 30

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

    private readonly units: Units

    private readonly enableOther: boolean

    private readonly valuePostfix: string | undefined

    private scale: number = 0

    private sum: number = 0

    constructor(data: PieData, pixel: Point, settings: ChartSettings) {
        this.data = data
        this.units = new Units(pixel)
        this.enableOther = settings.enableOther
        this.valuePostfix = settings.valuePostfix
    }

    private get radius() {
        const width = this.units.toPxX(COORDS_MAX_X)
        const height = this.units.toPxY(COORDS_MAX_Y)

        return Math.max(Math.min(width / 5, height / 2 - LABEL_SPACE), 0)
    }

    private get innerRatio() {
        return Math.min(Math.max(this.data.innerRadius ?? 0, 0), 100) / 100
    }

    private get labelDistance() {
        return this.radius + this.units.toPxX(LEADER_GAP + LEADER_LENGTH + LEADER_GAP)
    }

    getData() {
        this.sum = sum(this.data.values.filter(PieProcess.isVisible), s => s.value)
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
            const angle = PieProcess.isVisible(sector) ? sector.value * this.scale : 0
            const slice = { sector, key, children, startAngle: acc, angle }

            acc += angle

            return slice
        })
    }

    private getLabels(slices: Slice[]): Label[] {
        const result: Label[] = slices.map(slice => ({
            angle: slice.startAngle + slice.angle / 2,
            isVisible: slice.sector.disabled || PieProcess.isVisible(slice.sector)
        }))

        const center = {
            x: this.units.toPxX(COORDS_MAX_X / 2),
            y: this.units.toPxY(COORDS_MAX_Y / 2)
        }

        const distance = this.labelDistance

        const labels = slices.flatMap((slice, index) => {
            if (!PieProcess.isVisible(slice.sector))
                return []

            const middle = result[index].angle

            return [{
                index,
                middle,
                angle: middle,
                value: slice.sector.value,
                halfWidth: stringWidth(slice.sector.label, LABEL_FONT) / 2,
                halfHeight: LABEL_FONT / 2,
                center: { x: 0, y: 0 }
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

        const isOverlap = (a: Box, b: Box) => {
            return Math.abs(a.center.x - b.center.x) < a.halfWidth + b.halfWidth + LABEL_SPACING
                   && Math.abs(a.center.y - b.center.y) < a.halfHeight + b.halfHeight + LABEL_SPACING
        }

        const clamp = (label: Box) => {
            label.angle = Math.min(Math.max(label.angle, label.middle - LABEL_MAX_DRIFT), label.middle + LABEL_MAX_DRIFT)
            label.center = getCenter(label, label.angle)
        }

        for (const label of labels)
            label.center = getCenter(label, label.angle)

        for (let iteration = 0; iteration < LABEL_ITERATIONS; iteration++) {
            let isMoved = false

            for (let i = 0; i < labels.length; i++) {
                const isLast = i == labels.length - 1

                if (isLast && labels.length < 3)
                    break

                const current = labels[i]
                const next = labels[isLast ? 0 : i + 1]

                if (!isOverlap(current, next))
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
            const isVisible = kept.every(other => !isOverlap(label, other))

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
                 .position(COORDS_MAX_X / 2, COORDS_MAX_Y / 2)
                 .size(fontSize)
                 .align(TextAlignment.Center)
                 .key('inner-title')
                 .init(AnimationTiming.pieInit, 0, true)
        }
    }

    private groupTiny() {
        const items: Omit<Slice, 'startAngle' | 'angle'>[]
            = this.data.values.map((sector, index) => ({ sector, key: index.toString() }))

        if (!this.enableOther)
            return items

        const tiny = this.data.values.filter(sector => {
            return PieProcess.isVisible(sector) && sector.value * this.scale * this.radius < this.units.toPxX(MIN_SECTOR_WIDTH)
        })

        if (tiny.length < 2)
            return items

        const other = new Sector({
            label: TextResources.other,
            value: sum(tiny, s => s.value),
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

        const radius = this.units.x(this.radius)
        const innerRadius = radius * this.innerRatio

        const orbit = {
            ...center,
            radiusX: this.units.x(this.labelDistance),
            radiusY: this.units.y(this.labelDistance)
        }

        return (items: QueueItemsBuilder) => {
            const arc = items.arc()
                .position(center.x, center.y)
                .startAngle(startAngle)
                .endAngle(endAngle)
                .radius(radius)
                .innerRadius(innerRadius)
                .gap(SECTOR_GAP)
                .cornerRadius(SECTOR_CORNER_RADIUS)
                .grow(START_ANGLE)
                .leader(LEADER_GAP, LEADER_LENGTH, labelOffset)
                .fill()
                .gradient()
                .color(sector.color)
                .key(`sector-${ key }`)
                .init(AnimationTiming.pieInit)
                .interact()
                .tooltip(this.getTooltip(sector, children))
                .data(sector.data)
                .contextMenu()

            if (sector.disabled)
                arc.ghost()

            if (!label.isVisible)
                return

            const text = items.text(sector.label)
                .orbit(label.angle, orbit)
                .size(LABEL_FONT)
                .follow(arc.shape)
                .key(`sector-label-${ key }`)
                .init(AnimationTiming.pieLabelInit, AnimationTiming.pieInit, true)

            arc.shape.leaderLabel = text.dispose()

            if (sector.disabled)
                text.ghost()
        }
    }

    private static isVisible(sector: Sector) {
        return !sector.disabled && sector.value > 0
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