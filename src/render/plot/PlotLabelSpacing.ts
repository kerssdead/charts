import Units from '@/helpers/Units'
import { scientific, short, stringWidth } from '@/helpers/Text'
import { clamp } from '@/helpers/Geometry'
import { COORDS_MAX_X } from '@/static/constants/Index'
import { X_LABEL_FONT, X_LABEL_SPACING } from '@/render/plot/PlotConstants'

export default class PlotLabelSpacing {
    private readonly units: Units

    private readonly leftBoundary: number

    constructor(units: Units, leftBoundary: number) {
        this.units = units
        this.leftBoundary = leftBoundary
    }

    getValueLabels(values: number[], positions: number[], shortLabels: boolean) {
        const variants = [shortLabels, true]
            .map(isShort => values.map(value => short(value, isShort)))
            .concat([values.map(scientific)])

        const labels = variants.find(labels => !this.isOverlapping(labels, positions, 1)) ?? variants[variants.length - 1]
        const every = this.getLabelStep(labels, positions, 1)

        return labels.map((label, i) => i % every == 0 ? label : '')
    }

    getLabelStep(labels: string[], positions: number[], from: number) {
        let every = Math.max(1, from)

        while (every < labels.length && this.isOverlapping(labels, positions, every))
            every++

        return every
    }

    clampLabel(text: string, x: number) {
        const half = this.units.x(stringWidth(text, X_LABEL_FONT) / 2)

        return clamp(x, this.leftBoundary + half, COORDS_MAX_X - half)
    }

    private isOverlapping(labels: string[], positions: number[], every: number) {
        let right = -Infinity

        return labels.some((label, i) => {
            if (i % every != 0)
                return false

            const half = this.units.x(stringWidth(label, X_LABEL_FONT) / 2)
            const x = this.clampLabel(label, positions[i])
            const isOverlap = x - half < right

            right = x + half + this.units.x(X_LABEL_SPACING)

            return isOverlap
        })
    }
}