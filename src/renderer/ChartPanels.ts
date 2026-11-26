import ChartSettings from '@/types/ChartSettings'
import CanvasWindow from '@/types/CanvasWindow'
import Panel from '@/types/Panel'
import Point from '@/types/Point'
import RenderItem from '@/types/RenderItem'
import RenderItemScrollbar from '@/types/RenderItemScrollbar'
import Data from '@/types/interfaces/Data'
import ScrollDrag from '@/types/ScrollDrag'
import Layout from '@/renderer/Layout'
import ChartProcess from '@/render/ChartProcess'
import { createProcess } from '@/charts/ChartDefinitions'
import Queue from '@/render/Queue'
import QueueItemsBuilder, { QueueAction } from '@/builders/QueueItemsBuilder'
import { Layer } from '@/static/constants/Index'
import Rectangle from '@/helpers/Rectangle'
import ViewState from '@/charts/ViewState'
import { ThemePalette } from '@/Theme'
import { ItemFlag as f } from '@/static/ItemFlag'

export type PanelBuildRequest = {
    settings: ChartSettings
    viewState: ViewState
    isInitialized: boolean
    onChange: () => void
    theme: ThemePalette
}

type PanelBuild = PanelBuildRequest & {
    previousPanels: Panel[]
}

type PanelData = {
    fixed: QueueAction[]
    content: QueueAction[]
}

export default class ChartPanels {
    list: Panel[] = []

    constructor(private readonly queue: Queue, private readonly layout: Layout) {
    }

    get canScroll() {
        return this.list.some(panel => panel.canScroll)
    }

    clear() {
        this.list = []
    }

    build(request: PanelBuildRequest) {
        const build = { ...request, previousPanels: this.list }

        this.list = this.layout.getPanels(request.settings.charts, request.settings.columns)
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
        return this.list.find(panel => panel.canScroll && Rectangle.contains(panel.window, point))
    }

    private buildPanel(panel: Panel, index: number, build: PanelBuild) {
        const chart = build.settings.charts[index]
        const pixel = panel.pixel(this.layout.window)
        const process = createProcess(
            chart,
            pixel,
            { ...build.settings, theme: build.theme },
            { state: build.viewState.getChartState(index), panel, onChange: build.onChange }
        )

        panel.valueAxis = process.getValueAxis()
        panel.onContentChange = build.onChange

        panel.scroll = process.getScroll()
        panel.keepScroll(build.previousPanels[index])

        const data = this.getPanelData(process, this.layout.getPanelTitle(chart.title, pixel))
        const fixed = this.add(data.fixed, build)
        const content = this.add(data.content, build)

        for (const item of content)
            item.set(f.Scrollable, panel.scroll != null)

        ChartPanels.attachItems([...fixed, ...content], panel, build.settings.charts.length > 1 ? index : null)

        if (panel.scroll)
            this.queue.add([ChartPanels.getScrollbar(panel)])
    }

    private getPanelData(process: ChartProcess<Data>, title: QueueAction): PanelData {
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
            if (!item.is(f.Fixed))
                item.panel = panel

            if (keyIndex != null) {
                item.key &&= `${ keyIndex }-${ item.key }`
                item.hoverGroup &&= `${ keyIndex }-${ item.hoverGroup }`
            }
        }
    }

    private static getScrollbar(panel: Panel) {
        const item = new RenderItem(new RenderItemScrollbar(panel))

        item.set(f.Fixed, true)
        item.layer = Layer.Scrollbar

        return item
    }
}