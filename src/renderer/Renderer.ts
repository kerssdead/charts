import { getContext, releaseOffscreenLayer, renewBuffers } from '@/helpers/Canvas'
import ChartSettings from '@/types/ChartSettings'
import Legend from '@/legend/Legend'
import Queue from '@/render/Queue'
import { hasFixedHeader } from '@/charts/ChartDefinitions'
import Transition from '@/renderer/Transition'
import Overlay from '@/renderer/Overlay'
import TooltipOverlay from '@/renderer/TooltipOverlay'
import ContextMenuOverlay from '@/renderer/ContextMenuOverlay'
import FocusRing from '@/renderer/FocusRing'
import ChartMenu from '@/renderer/ChartMenu'
import { AnimationTiming } from '@/static/constants/Index'
import RendererTheme from '@/renderer/RendererTheme'
import { onImageLoad } from '@/helpers/Images'
import { guard } from '@/helpers/Errors'
import InputRouter from '@/renderer/InputRouter'
import Frames from '@/renderer/Frames'
import ViewState from '@/charts/ViewState'
import Scene from '@/renderer/Scene'

export default class Renderer {
    private static readonly RESIZE_REBUILD_DELAY = 150

    private readonly input: InputRouter

    private readonly frames: Frames

    private readonly scene: Scene

    private readonly tooltip: TooltipOverlay

    private readonly contextMenu: ContextMenuOverlay

    private readonly focusRing: FocusRing

    private readonly menu: ChartMenu

    private isApplied = false

    private isLaidOut = false

    private rebuildTimer: ReturnType<typeof setTimeout> | null = null

    private removeImageListener: (() => void) | null = null

    constructor(
        canvas: HTMLCanvasElement,
        private readonly viewState: ViewState,
        theme: RendererTheme,
        onError: (error: unknown) => void
    ) {
        this.scene = new Scene(new Queue(getContext(canvas)), theme)

        const { queue } = this.scene

        this.tooltip = new TooltipOverlay(canvas)
        this.menu = new ChartMenu(canvas, queue, point => this.input.pointer.openMenu(point), () => {
            this.frames.drawClean()
        })
        this.contextMenu = new ContextMenuOverlay(canvas, () => this.input.pointer.closeContext(), action => {
            guard(() => action(), onError)
        })
        this.contextMenu.fixedButtons = () => this.menu.getButtons()
        this.listenToImages()

        this.input = new InputRouter(canvas, this.scene, {
            openChartMenu: () => this.menu.open(),
            onChange: () => this.render(),
            onError
        })
        this.focusRing = new FocusRing(() => this.input.focusBounds)

        this.frames = new Frames(this.scene, this.input, {
            getOverlays: () => this.overlays,
            rebuildForTheme: () => this.rebuildAnimated(),
            renewCanvas: () => renewBuffers(canvas),
            releaseLayers: () => {
                releaseOffscreenLayer()
                queue.releaseLayers()
            },
            onError
        })
    }

    private get settings() {
        return this.scene.settings
    }

    apply(settings: ChartSettings) {
        this.scene.settings = settings

        this.cancelPendingRebuild()

        this.menu.apply(settings, value => this.viewState.isDisabled(value), this.scene.theme.getPalette())
        this.syncLegend()

        this.contextMenu.menu = settings.contextMenu

        this.tooltip.apply(settings)

        if (!this.frames.isSuspended)
            this.input.pointer.attach(this.settings.enableMove)

        if (this.isApplied)
            this.rebuildAnimated()
        else
            this.rebuild({ isInitialized: false })

        this.isApplied = true
    }

    private rebuild({ isInitialized }: { isInitialized: boolean }) {
        const { queue, layout, panels, theme } = this.scene

        queue.clear()

        for (const overlay of this.overlays)
            overlay.clear(queue)

        this.input.pointer.closeContext()

        if (layout.hasArea) {
            panels.build({
                settings: this.settings,
                viewState: this.viewState,
                isInitialized,
                onChange: () => this.rebuildAnimated(),
                theme: theme.getPalette()
            })
            this.input.pointer.setScrollable(panels.canScroll)
        } else {
            panels.clear()
        }

        this.render()
    }

    private rebuildAnimated() {
        if (this.settings.staticMode)
            return this.rebuild({ isInitialized: true })

        const { queue, panels } = this.scene
        const previous = Transition.snapshot(queue)
        const previousPanels = panels.list

        this.rebuild({ isInitialized: true })

        new Transition(queue, previousPanels, panels.list, AnimationTiming.rebuild).apply(previous)
    }

    resize(width: number, height: number, ratio: number) {
        const { layout } = this.scene

        layout.width = width
        layout.height = height
        this.menu.ratio = ratio
        this.scene.queue.ratio = ratio

        if (!this.isApplied)
            return

        const isResized = this.updateLayout()

        if (isResized && layout.hasArea) {
            if (this.isLaidOut)
                this.scheduleRebuild()
            else
                this.rebuild({ isInitialized: false })
        } else {
            this.render()
        }

        this.isLaidOut ||= layout.hasArea

        this.frames.drawNow()
    }

    private scheduleRebuild() {
        if (this.rebuildTimer != null)
            clearTimeout(this.rebuildTimer)

        this.rebuildTimer = setTimeout(() => {
            this.rebuildTimer = null

            const isInitialized = this.isLaidOut && !this.scene.queue.items.some(item => item.isInitializing)

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
        const { queue, panels, layout } = this.scene

        this.cancelPendingRebuild()

        this.input.pointer.detach()
        this.stopListeningToImages()

        this.removeLegend()
        this.menu.remove()

        this.tooltip.reset(queue)
        this.contextMenu.clear(queue)
        this.focusRing.clear(queue)
        queue.clear()
        queue.releaseLayers()

        this.frames.cancel()

        panels.clear()
        layout.reset()
        this.isApplied = false
        this.isLaidOut = false
    }

    suspend() {
        const { queue } = this.scene

        this.frames.suspend()

        this.input.pointer.detach()
        this.stopListeningToImages()
        this.tooltip.clear(queue)
        this.contextMenu.clear(queue)
        this.focusRing.clear(queue)
    }

    resume() {
        this.input.pointer.attach(this.settings.enableMove)
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
        else if (this.scene.legend)
            this.scene.legend.applySettings(this.settings)
        else
            this.scene.legend = new Legend(this.settings, this.viewState, () => this.rebuildAnimated())

        this.updateLayout()
    }

    private removeLegend() {
        this.scene.legend?.destroy(this.scene.queue)
        this.scene.legend = undefined
    }

    render() {
        this.frames.request()
    }

    private get overlays(): Overlay[] {
        return [this.tooltip, this.contextMenu, this.scene.legend, this.menu.button, this.focusRing]
            .filter(overlay => overlay !== undefined)
    }

    private updateLayout() {
        const reserveMenuRow = this.settings.charts.some(hasFixedHeader)

        return this.scene.layout.update({
            title: this.settings.title,
            legend: this.scene.legend,
            menu: this.menu.button,
            reserveMenuRow
        })
    }
}