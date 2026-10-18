import PieData from '@/types/data/PieData'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import Sector from '@/types/Sector'
import { AnimationTiming, COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'
import Point from '@/types/Point'
import TextResources from '@/static/TextResources'
import { clamp } from '@/helpers/Geometry'
import layoutLabels from '@/render/LabelLayout'
import { stringWidth } from '@/helpers/Text'
import { sum } from '@/helpers/Collections'
import ChartProcess from '@/render/ChartProcess'
import Theme from '@/Theme'
import { TextAlignment } from '@/static/Enums'

const LEADER_GAP = 20

const LEADER_LENGTH = 60

const LABEL_SPACE = 36

const LABEL_FONT = 14

const SECTOR_GAP = 20

const SECTOR_CORNER_RADIUS = 30

const MIN_SECTOR_WIDTH = SECTOR_GAP + SECTOR_CORNER_RADIUS * 2

const OTHER_KEY = 'other'

const INNER_TITLE_FONT = 16

const INNER_TITLE_MIN_FONT = 10

const INNER_TITLE_PADDING = .8

const START_ANGLE = 0

const CENTER = { x: COORDS_MAX_X / 2, y: COORDS_MAX_Y / 2 }

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

export default class PieProcess extends ChartProcess<PieData> {
    private readonly enableOther: boolean

    private readonly radius: number

    private readonly innerRatio: number

    private readonly labelDistance: number

    private scale: number = 0

    private sum: number = 0

    constructor(data: PieData, pixel: Point, valuePostfix: string | undefined, enableOther: boolean) {
        super(data, pixel, valuePostfix)

        this.enableOther = enableOther

        const width = this.units.toPxX(COORDS_MAX_X)
        const height = this.units.toPxY(COORDS_MAX_Y)

        this.radius = Math.max(Math.min(width / 5, height / 2 - LABEL_SPACE), 0)
        this.innerRatio = clamp(this.data.innerRadius ?? 0, 0, 100) / 100
        this.labelDistance = this.radius + this.units.toPxX(LEADER_GAP + LEADER_LENGTH + LEADER_GAP)
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

        const visible = slices.flatMap((slice, index) => PieProcess.isVisible(slice.sector) ? [index] : [])

        const placements = layoutLabels(visible.map(index => ({
            angle: result[index].angle,
            value: slices[index].sector.value,
            halfWidth: stringWidth(slices[index].sector.label, LABEL_FONT) / 2,
            halfHeight: LABEL_FONT / 2
        })), this.labelDistance)

        visible.forEach((index, i) => result[index] = placements[i])

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
                 .position(CENTER.x, CENTER.y)
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
            color: Theme.other
        })

        return [
            ...items.filter(item => !tiny.includes(item.sector)),
            { sector: other, key: OTHER_KEY, children: tiny }
        ]
    }

    private getSector({ sector, key, children, startAngle, angle }: Slice, label: Label) {
        const endAngle = startAngle + angle
        const labelOffset = label.angle - (startAngle + angle / 2)

        const radius = this.units.x(this.radius)
        const innerRadius = radius * this.innerRatio

        const orbit = {
            ...CENTER,
            radiusX: this.units.x(this.labelDistance),
            radiusY: this.units.y(this.labelDistance)
        }

        return (items: QueueItemsBuilder) => {
            const arc = items.arc()
                .position(CENTER.x, CENTER.y)
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

        return this.tooltip(...rows)
    }

    private getPercent(value: number) {
        return this.percent(this.sum == 0 ? 0 : value / this.sum)
    }
}