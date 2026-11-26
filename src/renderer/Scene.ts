import Queue from '@/render/Queue'
import Layout from '@/renderer/Layout'
import ChartPanels from '@/renderer/ChartPanels'
import RendererTheme from '@/renderer/RendererTheme'
import Legend from '@/legend/Legend'
import ChartSettings from '@/types/ChartSettings'

export default class Scene {
    readonly layout = new Layout()

    readonly panels: ChartPanels

    settings!: ChartSettings

    legend?: Legend

    constructor(readonly queue: Queue, readonly theme: RendererTheme) {
        this.panels = new ChartPanels(queue, this.layout)
    }
}