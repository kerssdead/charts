import CanvasWindow from '@/types/CanvasWindow'
import Point from '@/types/Point'
import type PlotProcess from '@/render/PlotProcess'
import RectangleDimensions from '@/types/RectangleDimensions'
import { clamp } from '@/helpers/Geometry'

const GAP = 16

export default class Panel {
    readonly index: number

    readonly rect: RectangleDimensions

    readonly window: CanvasWindow = new CanvasWindow(0, 0)

    plot: PlotProcess | null = null

    constructor(index: number, rect: RectangleDimensions) {
        this.index = index
        this.rect = rect
    }

    update(window: CanvasWindow) {
        this.window.x = window.x + window.width * this.rect.x
        this.window.y = window.y + window.height * this.rect.y
        this.window.width = window.width * this.rect.width
        this.window.height = window.height * this.rect.height
    }

    pixel(window: CanvasWindow): Point {
        const { x, y } = window.pixel

        return {
            x: x / (this.rect.width || 1),
            y: y / (this.rect.height || 1)
        }
    }

    static grid(titles: number[], width: number, height: number, columns?: number): Panel[] {
        if (titles.length == 1 && titles[0] == 0)
            return [new Panel(0, { x: 0, y: 0, width: 1, height: 1 })]

        const cols = clamp(columns ?? Panel.getColumns(titles.length, width, height), 1, titles.length)
        const rows = Math.ceil(titles.length / cols)

        const cellWidth = Math.max((width - GAP * (cols - 1)) / cols, 0)
        const cellHeight = Math.max((height - GAP * (rows - 1)) / rows, 0)

        return titles.map((title, index) => {
            const x = (index % cols) * (cellWidth + GAP)
            const y = Math.floor(index / cols) * (cellHeight + GAP) + title

            return new Panel(index, {
                x: width > 0 ? x / width : 0,
                y: height > 0 ? y / height : 0,
                width: width > 0 ? cellWidth / width : 1,
                height: height > 0 ? Math.max(cellHeight - title, 0) / height : 1
            })
        })
    }

    private static getColumns(count: number, width: number, height: number) {
        let best = 1
        let bestSize = -1

        for (let cols = 1; cols <= count; cols++) {
            const size = Math.min(width / cols, height / Math.ceil(count / cols))

            if (size > bestSize) {
                best = cols
                bestSize = size
            }
        }

        return best
    }
}