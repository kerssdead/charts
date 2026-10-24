import Units from '@/helpers/Units'
import Point from '@/types/Point'
import { CANVAS_CENTER, COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'
import { getInnerRadiusRatio } from '@/helpers/Geometry'
import { GaugeStep } from '@/render/gauge/GaugeSteps'
import {
    CANVAS_PADDING,
    DEFAULT_INNER_RADIUS,
    LABEL_FONT_SIZE,
    LABEL_GAP,
    RANGE_FONT_SIZE
} from '@/render/gauge/GaugeConstants'

export default class GaugeSizing {
    readonly radius: number

    readonly innerRadiusRatio: number

    readonly ringMiddleRadius: number

    readonly ringThickness: number

    readonly labelAreaHeight: number

    readonly centerInCoords: Point

    private readonly width: number

    private readonly height: number

    private readonly rangeLabelAreaHeight: number

    constructor(
        units: Units,
        innerRadiusPercent: number,
        steps: GaugeStep[],
        labelRowCount: number,
        ringCount: number
    ) {
        this.width = units.toPxX(COORDS_MAX_X)
        this.height = units.toPxY(COORDS_MAX_Y)
        this.rangeLabelAreaHeight = LABEL_GAP + RANGE_FONT_SIZE

        this.labelAreaHeight = LABEL_GAP + LABEL_FONT_SIZE * labelRowCount + LABEL_GAP
        this.innerRadiusRatio = getInnerRadiusRatio(innerRadiusPercent, DEFAULT_INNER_RADIUS)
        this.radius = this.getFittedRadius(units, steps)
        this.ringMiddleRadius = this.radius * (1 + this.innerRadiusRatio) / 2
        this.ringThickness = ringCount == 0 ? 0 : this.radius * (1 - this.innerRadiusRatio) / ringCount
        const centerYInPx = (this.height - this.radius - this.labelAreaHeight + this.rangeLabelAreaHeight) / 2
                            + this.radius

        this.centerInCoords = { x: CANVAS_CENTER.x, y: units.y(centerYInPx) }
    }

    private getFittedRadius(units: Units, steps: GaugeStep[]) {
        const halfAvailableWidth = this.width / 2 - units.toPxX(CANVAS_PADDING)

        return Math.max(
            Math.min(
                halfAvailableWidth,
                this.height - this.labelAreaHeight - this.rangeLabelAreaHeight - units.toPxY(CANVAS_PADDING) * 2,
                ...steps.map(
                    step => (halfAvailableWidth - step.textWidth) / Math.abs(Math.cos(step.angle)) - LABEL_GAP
                )
            ),
            0
        )
    }
}