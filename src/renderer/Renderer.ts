import { getContext } from '@/helpers/Canvas'
import ChartSettings from '@/types/ChartSettings'
import Legend from '@/legend/Legend'
import Queue from '@/render/Queue'
import { hasFixedHeader } from '@/charts/ChartDefinitions'
import Transition from '@/renderer/Transition'
import ChartPanels from '@/renderer/ChartPanels'
import Overlay from '@/renderer/Overlay'
import TooltipOverlay from '@/renderer/TooltipOverlay'
import ContextMenuOverlay from '@/renderer/ContextMenuOverlay'
import FocusRing from '@/renderer/FocusRing'
import Layout from '@/renderer/Layout'
import ChartMenu from '@/renderer/ChartMenu'
import { AnimationTiming } from '@/static/constants/Index'
import RendererTheme from '@/renderer/RendererTheme'
import { onImageLoad } from '@/helpers/Images'
import { guard } from '@/helpers/Errors'
import InputRouter from '@/renderer/InputRouter'
import Frames from '@/renderer/Frames'
import ViewState from '@/charts/ViewState'

export default class Renderer {
    private static readonly RESIZE_REBUILD_DELAY = 150

    private readonly input: InputRouter

    private readonly frames: Frames

    private readonly queue: Queue

    private readonly tooltip: TooltipOverlay

    private readonly contextMenu: ContextMenuOverlay

    private readonly focusRing: FocusRing

    private readonly layout = new Layout()

    private readonly menu: ChartMenu

    private isApplied: boolean = false

    private isLaidOut: boolean = false

    private rebuildTimer: ReturnType<typeof setTimeout> | null = null

    private legend: Legend | undefined

    private readonly panels: ChartPanels

    private settings!: ChartSettings

    private removeImageListener: (() => void) | null = null

    private readonly viewState: ViewState

    private readonly theme: RendererTheme

    constructor(
        canvas: HTMLCanvasElement,
        viewState: ViewState,
        theme: RendererTheme,
        onError: (error: unknown) => void
    ) {
        this.viewState = viewState
        this.theme = theme
        this.queue = new Queue(getContext(canvas))
        this.panels = new ChartPanels(this.queue, this.layout)
        this.tooltip = new TooltipOverlay(canvas)
        this.menu = new ChartMenu(canvas, this.queue, point => this.input.openMenu(point), () => {
            this.frames.drawClean()
        })
        this.contextMenu = new ContextMenuOverlay(canvas, () => this.input.closeContext(), action => {
            guard(() => action(), onError)
        })
        this.contextMenu.fixedButtons = () => this.menu.getButtons()
        this.listenToImages()

        this.input = new InputRouter(canvas, {
            queue: this.queue,
            layout: this.layout,
            panels: this.panels,
            getSettings: () => this.settings,
            openChartMenu: () => this.menu.open(),
            onChange: () => this.render(),
            onError
        })
        this.focusRing = new FocusRing(() => this.input.focusBounds)

        this.frames = new Frames({
            queue: this.queue,
            layout: this.layout,
            panels: this.panels,
            input: this.input,
            getLegend: () => this.legend,
            getOverlays: () => this.overlays,
            getSettings: () => this.settings,
            getThemePalette: () => this.theme.getPalette(),
            syncTheme: () => this.theme.sync(),
            rebuildForTheme: () => this.rebuildAnimated(),
            onError
        })
    }

    apply(settings: ChartSettings) {
        this.settings = settings

        this.cancelPendingRebuild()

        this.menu.apply(settings, value => this.viewState.isDisabled(value), this.theme.getPalette())
        this.syncLegend()

        this.contextMenu.menu = settings.contextMenu

        this.tooltip.apply(settings)

        if (!this.frames.isSuspended)
            this.input.attach(this.settings.enableMove)

        if (this.isApplied)
            this.rebuildAnimated()
        else
            this.rebuild({ isInitialized: false })

        this.isApplied = true
    }

    private rebuild({ isInitialized }: { isInitialized: boolean }) {
        this.queue.clear()

        for (const overlay of this.overlays)
            overlay.clear(this.queue)

        this.input.closeContext()

        if (this.layout.hasArea) {
            this.panels.build({
                settings: this.settings,
                viewState: this.viewState,
                isInitialized,
                onChange: () => this.rebuildAnimated(),
                theme: this.theme.getPalette()
            })
            this.input.setScrollable(this.panels.canScroll)
        } else {
            this.panels.clear()
        }

        this.render()
    }

    private rebuildAnimated() {
        if (this.settings.staticMode)
            return this.rebuild({ isInitialized: true })

        const previous = Transition.snapshot(this.queue)
        const previousPanels = this.panels.list

        this.rebuild({ isInitialized: true })

        new Transition(this.queue, previousPanels, this.panels.list, AnimationTiming.rebuild).apply(previous)
    }

    resize(width: number, height: number, ratio: number) {
        this.layout.width = width
        this.layout.height = height
        this.menu.ratio = ratio
        this.queue.ratio = ratio

        if (!this.isApplied)
            return

        const isResized = this.updateLayout()

        if (isResized && this.layout.hasArea) {
            if (this.isLaidOut)
                this.scheduleRebuild()
            else
                this.rebuild({ isInitialized: false })
        } else {
            this.render()
        }

        this.isLaidOut ||= this.layout.hasArea

        this.frames.drawNow()
    }

    private scheduleRebuild() {
        if (this.rebuildTimer != null)
            clearTimeout(this.rebuildTimer)

        this.rebuildTimer = setTimeout(() => {
            this.rebuildTimer = null

            const isInitialized = this.isLaidOut && !this.queue.items.some(item => item.isInitializing)

            this.rebuild({ isInitialized })
        }, Renderer.RESIZE_REBUILD_DELAY)
    }

    private cancelPendingRebuild() {
        if (this.rebuildTimer == null)
            return

        clearTimeout(this.rebuildTimer)
        this.rebuildTimer = null
    }

    destroy() {
        this.cancelPendingRebuild()

        this.input.detach()
        this.stopListeningToImages()

        this.removeLegend()
        this.menu.remove()

        this.tooltip.reset(this.queue)
        this.contextMenu.clear(this.queue)
        this.focusRing.clear(this.queue)
        this.queue.clear()

        this.frames.cancel()

        this.panels.clear()
        this.layout.reset()
        this.isApplied = false
        this.isLaidOut = false
    }

    suspend() {
        this.frames.suspend()

        this.input.detach()
        this.stopListeningToImages()
        this.tooltip.clear(this.queue)
        this.contextMenu.clear(this.queue)
        this.focusRing.clear(this.queue)
    }

    resume() {
        this.input.attach(this.settings.enableMove)
        this.listenToImages()

        this.frames.resume()
    }

    private listenToImages() {
        this.removeImageListener ??= onImageLoad(() => this.render())
    }

    private stopListeningToImages() {
        this.removeImageListener?.()
        this.removeImageListener = null
    }

    private syncLegend() {
        if (!this.settings.enableLegend)
            this.removeLegend()
        else if (this.legend)
            this.legend.applySettings(this.settings)
        else
            this.legend = new Legend(this.settings, this.viewState, () => this.rebuildAnimated())

        this.updateLayout()
    }

    private removeLegend() {
        this.legend?.destroy(this.queue)
        this.legend = undefined
    }

    render(): void {
        this.frames.request()
    }

    private get overlays(): Overlay[] {
        return [this.tooltip, this.contextMenu, this.legend, this.menu.button, this.focusRing]
            .filter(overlay => overlay !== undefined)
    }

    private updateLayout() {
        const reserveMenuRow = this.settings.charts.some(hasFixedHeader)

        return this.layout.update({
            title: this.settings.title,
            legend: this.legend,
            menu: this.menu.button,
            reserveMenuRow
        })
    }
}