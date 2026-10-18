import ChartSettings from '@/types/ChartSettings'
import MenuButton from '@/renderer/MenuButton'
import Point from '@/types/Point'
import Queue from '@/render/Queue'
import ButtonOptions, { DIVIDER } from '@/types/ButtonOptions'
import Export from '@/export/Export'
import Modal from '@/ui/Modal'
import Decomposition from '@/export/Decomposition'
import TextResources from '@/static/TextResources'
import { ContextMenu } from '@/static/constants/Index'

export default class ChartMenu {
    ratio: number = 1

    button: MenuButton | undefined

    private settings: ChartSettings

    private buttons: ButtonOptions[] | undefined

    private readonly canvas: HTMLCanvasElement

    private readonly queue: Queue

    private readonly onOpen: (point: Point) => void

    constructor(canvas: HTMLCanvasElement, queue: Queue, onOpen: (point: Point) => void) {
        this.canvas = canvas
        this.queue = queue
        this.onOpen = onOpen
    }

    apply(settings: ChartSettings) {
        this.settings = settings
        this.buttons = undefined

        if (settings.disableInteractions) {
            this.remove()
        } else if (!this.button) {
            this.button = new MenuButton()
            this.button.onClick = () => {
                const bounds = this.button?.bounds

                if (bounds)
                    this.onOpen({ x: bounds.right, y: bounds.bottom })
            }
        }
    }

    remove() {
        this.button?.clear(this.queue)
        this.button = undefined
    }

    private static afterMenuClosed(action: () => void) {
        setTimeout(action, ContextMenu.fadeDuration)
    }

    getButtons() {
        const { title, charts } = this.settings

        return this.buttons ??= [
            {
                text: TextResources.exportPNG,
                action: () => ChartMenu.afterMenuClosed(() => {
                    Export.asPng(this.canvas, this.ratio, title, this.button?.bounds, this.settings.isDarkThemeFunction)
                })
            },
            {
                text: TextResources.exportCSV,
                action: () => Export.asCsv(charts, title)
            },
            DIVIDER,
            {
                text: TextResources.decomposeToTable,
                action: () => new Modal(Decomposition.fromCharts(charts), title || TextResources.dataAsTable).open()
            }
        ]
    }
}