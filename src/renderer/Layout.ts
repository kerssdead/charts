import CanvasWindow from '@/types/CanvasWindow'
import Legend from '@/Legend'
import MenuButton from '@/renderer/MenuButton'
import Paddings, { NO_PADDINGS } from '@/types/Paddings'
import Panel from '@/types/Panel'
import Point from '@/types/Point'
import ChartItem from '@/types/ChartItem'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import { AnimationTiming, CANVAS_CENTER, COORDS_MAX_X, COORDS_MAX_Y } from '@/static/constants/Index'
import { TextAlignment } from '@/static/Enums'
import { clamp } from '@/helpers/Geometry'
import { stringWidth } from '@/helpers/Text'
import TextResources from '@/static/TextResources'

const TITLE_FONT = 20

const TITLE_MIN_FONT = 14

const TITLE_PADDING = 12

const PANEL_TITLE_FONT = 16

const PANEL_TITLE_MIN_FONT = 12

const PANEL_TITLE_PADDING = 8

const PANEL_TITLE_HEIGHT = PANEL_TITLE_FONT + PANEL_TITLE_PADDING * 2

export default class Layout {
    width: number = 0

    height: number = 0

    window = new CanvasWindow(0, 0)

    screen = new CanvasWindow(0, 0)

    private title: string | undefined

    private titleInset: number = TITLE_PADDING

    private hasMenuRow: boolean = false

    get hasArea() {
        return this.window.width > 0 && this.window.height > 0
    }

    private get titleHeight() {
        if (this.title)
            return TITLE_FONT + TITLE_PADDING * 2

        return this.hasMenuRow ? MenuButton.rowHeight : 0
    }

    reset() {
        this.window = new CanvasWindow(this.width, this.height)
    }

    update(title: string | undefined, legend: Legend | undefined, menu: MenuButton | undefined, reserveMenuRow: boolean = false): boolean {
        this.title = title
        this.hasMenuRow = reserveMenuRow && !!menu

        legend?.resize(this.width, this.height, this.titleHeight)
        menu?.resize(this.width, this.height, this.titleHeight)

        this.titleInset = Math.max(menu?.bounds ? this.width - menu.bounds.left : 0, TITLE_PADDING)

        this.screen = new CanvasWindow(this.width, this.height)

        return this.fit(legend?.reserved ?? NO_PADDINGS)
    }

    fit({ left, top, right, bottom }: Paddings): boolean {
        const { width, height } = this

        top += this.titleHeight

        return this.window.fit(left, top,
            Math.max(width - left - right, 0),
            Math.max(height - top - bottom, 0))
    }

    getPanels(charts: ChartItem[], columns?: number) {
        const titles = charts.map(chart => chart.title ? PANEL_TITLE_HEIGHT : 0)

        const panels = Panel.grid(titles, this.window.baseWidth, this.window.baseHeight, columns)

        for (const panel of panels)
            panel.update(this.window)

        return panels
    }

    getTitle() {
        const { title, height } = this

        if (!title)
            return QueueItemsBuilder.empty

        const width = this.width - this.titleInset * 2
        const font = clamp(width / stringWidth(title, 1), TITLE_MIN_FONT, TITLE_FONT)

        return (items: QueueItemsBuilder) => {
            items.text(Legend.truncate(title, width, font))
                 .position(CANVAS_CENTER.x, this.titleHeight / 2 * COORDS_MAX_Y / height)
                 .size(font)
                 .align(TextAlignment.Center)
                 .fixed()
                 .key('title')
                 .init(AnimationTiming.title, 0, true)
        }
    }

    getPanelTitle(title: string | undefined, pixel: Point) {
        if (!title)
            return QueueItemsBuilder.empty

        const width = COORDS_MAX_X / pixel.x - PANEL_TITLE_PADDING * 2
        const font = clamp(width / stringWidth(title, 1), PANEL_TITLE_MIN_FONT, PANEL_TITLE_FONT)

        return (items: QueueItemsBuilder) => {
            items.text(Legend.truncate(title, width, font))
                 .position(CANVAS_CENTER.x, -PANEL_TITLE_HEIGHT / 2 * pixel.y)
                 .size(font)
                 .align(TextAlignment.Center)
                 .key('panel-title')
                 .init(AnimationTiming.title, 0, true)
        }
    }

    getEmpty() {
        return (items: QueueItemsBuilder) => {
            items.text(TextResources.noData)
                 .position(CANVAS_CENTER.x, CANVAS_CENTER.y)
                 .size(PANEL_TITLE_FONT)
                 .align(TextAlignment.Center)
                 .key('empty')
                 .init(AnimationTiming.title, 0, true)
        }
    }
}