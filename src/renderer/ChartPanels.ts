import ChartSettings from '@/types/ChartSettings'
import CanvasWindow from '@/types/CanvasWindow'
import Panel from '@/types/Panel'
import Point from '@/types/Point'
import RenderItem from '@/types/RenderItem'
import RenderItemScrollbar from '@/types/RenderItemScrollbar'
import Data from '@/types/interfaces/Data'
import { ScrollDrag } from '@/renderer/Pointer'
import Layout from '@/renderer/Layout'
import ChartProcess from '@/render/ChartProcess'
import ProcessFactory from '@/render/ProcessFactory'
import PlotProcess from '@/render/plot/PlotProcess'
import Queue from '@/render/Queue'
import QueueItemsBuilder, { QueueAction } from '@/builders/QueueItemsBuilder'
import { Layer } from '@/static/constants/Index'
import { contains } from '@/helpers/Geometry'

type PanelBuild = {
    settings: ChartSettings
    isInitialized: boolean
    previousPanels: Panel[]
    onChange: () => void
}

type PanelData = {
    fixed: QueueAction[]
    content: QueueAction[]
}

export default class ChartPanels {
    list: Panel[] = []

    private readonly queue: Queue

    private readonly layout: Layout

    constructor(queue: Queue, layout: Layout) {
        this.queue = queue
        this.layout = layout
    }

    get canScroll() {
        return this.list.some(panel => panel.canScroll)
    }

    clear() {
        this.list = []
    }

    build(settings: ChartSettings, isInitialized: boolean, onChange: () => void) {
        const build = { settings, isInitialized, previousPanels: this.list, onChange }

        this.list = this.layout.getPanels(settings.charts, settings.columns)
        this.list.forEach((panel, index) => this.buildPanel(panel, index, build))

        this.add([this.layout.getTitle()], build)
    }

    animate(timestamp: DOMHighResTimeStamp, window: CanvasWindow) {
        let isAnimating = false

        for (const panel of this.list) {
            isAnimating = panel.animateScroll(timestamp) || isAnimating

            panel.update(window)
        }

        return isAnimating
    }

    scrollBy(point: Point, delta: number): boolean | null {
        const panel = this.getScrollablePanel(point)

        return panel ? panel.glideBy(delta) : null
    }

    getScrollDrag(point: Point): ScrollDrag | null {
        return this.getScrollablePanel(point)?.getDrag(point) ?? null
    }

    private getScrollablePanel(point: Point) {
        return this.list.find(panel => panel.canScroll && contains(panel.window, point))
    }

    private buildPanel(panel: Panel, index: number, build: PanelBuild) {
        const chart = build.settings.charts[index]
        const pixel = panel.pixel(this.layout.window)
        const process = ProcessFactory.create(chart, pixel, build.settings)

        panel.plot = process instanceof PlotProcess ? process : null

        if (process)
            process.onChange = build.onChange

        panel.scroll = process?.getScroll() ?? null
        panel.keepScroll(build.previousPanels[index])

        const data = this.getPanelData(process, this.layout.getPanelTitle(chart.title, pixel))
        const fixed = this.add(data.fixed, build)
        const content = this.add(data.content, build)

        for (const item of content)
            item.isScrollable = panel.scroll != null

        ChartPanels.attachItems([...fixed, ...content], panel, build.settings.charts.length > 1 ? index : null)

        if (panel.scroll)
            this.queue.add([ChartPanels.getScrollbar(panel)])
    }

    private getPanelData(process: ChartProcess<Data> | undefined, title: QueueAction): PanelData {
        if (!process)
            return { fixed: [title], content: [] }

        if (process.isEmpty())
            return { fixed: [title], content: [this.layout.getEmpty()] }

        return { fixed: [...process.getFixedData(), title], content: process.getData() }
    }

    private add(actions: QueueAction[], build: PanelBuild) {
        const items = QueueItemsBuilder.build(actions, build.isInitialized || build.settings.staticMode)

        this.queue.add(items)

        return items
    }

    private static attachItems(items: RenderItem[], panel: Panel, keyIndex: number | null) {
        for (const item of items) {
            if (!item.isFixed)
                item.panel = panel

            if (keyIndex != null) {
                item.key &&= `${ keyIndex }-${ item.key }`
                item.hoverGroup &&= `${ keyIndex }-${ item.hoverGroup }`
            }
        }
    }

    private static getScrollbar(panel: Panel) {
        const item = new RenderItem(new RenderItemScrollbar(panel))

        item.isFixed = true
        item.layer = Layer.Scrollbar

        return item
    }
}