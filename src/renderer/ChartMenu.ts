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
import { hasMenu } from '@/charts/ChartDefinitions'
import { ThemePalette } from '@/Theme'
import { IsDisabled } from '@/types/ChartViewState'

export default class ChartMenu {
    ratio: number = 1

    button: MenuButton | undefined

    private settings!: ChartSettings

    private buttons: ButtonOptions[] | undefined

    private readonly canvas: HTMLCanvasElement

    private readonly queue: Queue

    private isDisabled!: IsDisabled

    private theme!: ThemePalette

    private readonly onOpen: (point: Point) => void

    private readonly drawClean: () => void

    constructor(canvas: HTMLCanvasElement, queue: Queue, onOpen: (point: Point) => void, drawClean: () => void) {
        this.canvas = canvas
        this.queue = queue
        this.onOpen = onOpen
        this.drawClean = drawClean
    }

    apply(settings: ChartSettings, isDisabled: IsDisabled, theme: ThemePalette) {
        this.settings = settings
        this.isDisabled = isDisabled
        this.theme = theme
        this.buttons = undefined

        if (settings.disableInteractions || settings.disableMenu
            || !settings.charts.some(hasMenu)) {
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

    getButtons() {
        const { title, charts } = this.settings

        return this.buttons ??= [
            {
                text: TextResources.exportPNG,
                action: () => setTimeout(() => {
                    Export.asPng(this.canvas, {
                        ratio: this.ratio,
                        title,
                        exclude: this.button?.bounds,
                        theme: this.theme,
                        prepare: this.drawClean
                    })
                }, ContextMenu.fadeDuration)
            },
            {
                text: TextResources.exportCSV,
                action: () => Export.asCsv(charts, title)
            },
            DIVIDER,
            {
                text: TextResources.decomposeToTable,
                action: () => new Modal(
                    Decomposition.fromCharts(
                        charts,
                        this.isDisabled,
                        () => Export.asCsv(charts, title),
                        this.settings.decimals
                    ),
                    title || TextResources.dataAsTable,
                    this.theme.isDark
                ).open()
            }
        ]
    }
}