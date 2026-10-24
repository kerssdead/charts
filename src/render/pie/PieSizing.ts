import Units from '@/helpers/Units'
import Point from '@/types/Point'
import { COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'
import { getInnerRadiusRatio } from '@/helpers/Geometry'
import { HOVER_OFFSET } from '@/types/RenderItemArc'
import {
    ELONGATED_ASPECT_RATIO,
    LABEL_VERTICAL_SPACE,
    LEADER_GAP,
    LEADER_LENGTH,
    MIN_RADIUS,
    PINNED_SECTOR_OFFSET,
    RADIUS_SHARE_OF_LABEL_SIDE,
    SIDE_PADDING
} from '@/render/pie/PieConstants'

export default class PieSizing {
    readonly radius: number

    readonly innerRadiusRatio: number

    readonly labelDistance: number

    readonly labelBounds: Point

    readonly areLabelsHidden: boolean

    private readonly width: number

    private readonly height: number

    private readonly isWide: boolean

    private readonly isTall: boolean

    constructor(units: Units, innerRadiusPercent: number) {
        this.width = units.toPxX(COORDS_MAX_X) - PINNED_SECTOR_OFFSET * 2
        this.height = units.toPxY(COORDS_MAX_Y) - PINNED_SECTOR_OFFSET * 2

        this.isWide = this.width > this.height * ELONGATED_ASPECT_RATIO
        this.isTall = this.height > this.width * ELONGATED_ASPECT_RATIO

        const fittedRadius = this.getFittedRadius()

        this.radius = Math.max(
            fittedRadius,
            Math.min(MIN_RADIUS, this.height / 2 - SIDE_PADDING, this.width / 2 - SIDE_PADDING),
            0
        )
        this.areLabelsHidden = !this.hasRoomForLabels(fittedRadius)
        this.innerRadiusRatio = getInnerRadiusRatio(innerRadiusPercent, 0)
        this.labelDistance = this.radius + units.toPxX(LEADER_GAP + LEADER_LENGTH + LEADER_GAP)
        this.labelBounds = { x: this.width / 2 - HOVER_OFFSET, y: this.height / 2 - HOVER_OFFSET }
    }

    private getFittedRadius() {
        if (this.isWide)
            return Math.min(this.width * RADIUS_SHARE_OF_LABEL_SIDE, this.height / 2 - SIDE_PADDING)

        if (this.isTall)
            return Math.min(this.width / 2 - SIDE_PADDING, this.height * RADIUS_SHARE_OF_LABEL_SIDE)

        return Math.min(this.width * RADIUS_SHARE_OF_LABEL_SIDE, this.height / 2 - LABEL_VERTICAL_SPACE)
    }

    private hasRoomForLabels(fittedRadius: number) {
        if (this.isWide)
            return this.width * RADIUS_SHARE_OF_LABEL_SIDE >= MIN_RADIUS

        if (this.isTall)
            return this.height * RADIUS_SHARE_OF_LABEL_SIDE >= MIN_RADIUS

        return fittedRadius >= MIN_RADIUS
    }
}