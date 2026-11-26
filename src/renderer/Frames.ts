import AnimationFrame from '@/renderer/AnimationFrame'
import InputRouter from '@/renderer/InputRouter'
import Queue from '@/render/Queue'
import Layout from '@/renderer/Layout'
import ChartPanels from '@/renderer/ChartPanels'
import Overlay from '@/renderer/Overlay'
import Legend from '@/legend/Legend'
import ChartSettings from '@/types/ChartSettings'
import Frame from '@/renderer/Frame'
import Panel from '@/types/Panel'
import RectangleDimensions from '@/types/RectangleDimensions'
import Rectangle from '@/helpers/Rectangle'
import { ThemePalette } from '@/Theme'
import { guard } from '@/helpers/Errors'
import { prefersReducedMotion } from '@/helpers/Motion'

type FrameScene = {
    queue: Queue
    layout: Layout
    panels: ChartPanels
    input: InputRouter
    getLegend: () => Legend | undefined
    getOverlays: () => Overlay[]
    getSettings: () => ChartSettings
    getThemePalette: () => ThemePalette
    syncTheme: () => boolean
    rebuildForTheme: () => void
    renewCanvas: () => void
    releaseLayers: () => void
    onError: (error: unknown) => void
}

type PanelState = {
    window: RectangleDimensions
    body: RectangleDimensions
}

type FrameRenderState = {
    version: number
    theme: ThemePalette
    window: RectangleDimensions
    screen: RectangleDimensions
    panels: PanelState[]
}

export default class Frames {
    private static readonly SETTLE_DELAY = 2000

    private readonly scene: FrameScene

    private readonly animationFrame: AnimationFrame

    private isClean: boolean = false

    isSuspended: boolean = false

    private wasAnimating: boolean = false

    private lastRender: FrameRenderState | null = null

    private settleTimer: ReturnType<typeof setTimeout> | null = null

    constructor(scene: FrameScene) {
        this.scene = scene
        this.animationFrame = new AnimationFrame(timestamp => guard(() => this.draw(timestamp), scene.onError))
    }

    request() {
        if (!this.isSuspended)
            this.animationFrame.request()
    }

    cancel() {
        this.animationFrame.cancel()
        this.cancelSettle()
    }

    drawNow() {
        if (this.isSuspended)
            return

        this.animationFrame.cancel()
        this.lastRender = null

        this.draw(performance.now())
    }

    drawClean() {
        this.isClean = true

        this.animationFrame.cancel()
        this.draw(performance.now())

        this.isClean = false

        this.request()
    }

    suspend() {
        this.isSuspended = true

        this.cancel()
    }

    resume() {
        this.isSuspended = false

        this.request()
    }

    private syncTheme() {
        if (this.scene.syncTheme())
            this.scene.rebuildForTheme()
    }

    private shouldDrawInstant(settings: ChartSettings) {
        return settings.staticMode || this.isClean || prefersReducedMotion()
    }

    private draw(timestamp: DOMHighResTimeStamp) {
        const { queue, layout, input } = this.scene
        const settings = this.scene.getSettings()

        this.syncTheme()

        const theme = this.scene.getThemePalette()
        const isInstant = this.shouldDrawInstant(settings)
        const { window, screen } = layout
        const position = this.isClean ? null : input.position
        const legend = this.scene.getLegend()
        const movingLegend = legend?.isMoving ? legend : undefined
        const frame = {
            queue,
            window,
            screen,
            mouse: position,
            context: input.context,
            now: timestamp,
            theme,
            isInstant
        }

        let isAnimating = this.animateScene(frame, movingLegend)

        if (this.shouldRender(isInstant, isAnimating, theme)) {
            const canReuseLayers = !isInstant && !this.isSceneChanged(theme)

            isAnimating = queue.render(timestamp, window, screen, theme, canReuseLayers) || isAnimating

            this.lastRender = {
                version: queue.version,
                theme,
                window: Rectangle.copy(window),
                screen: Rectangle.copy(screen),
                panels: this.getPanelStates()
            }
        }

        if (isAnimating)
            this.cancelSettle()
        else if (this.wasAnimating)
            this.scheduleSettle()

        this.wasAnimating = isAnimating

        if (isAnimating)
            this.request()
    }

    private scheduleSettle() {
        this.cancelSettle()

        this.settleTimer = setTimeout(() => {
            this.settleTimer = null

            guard(() => {
                this.scene.renewCanvas()
                this.drawNow()
                this.scene.releaseLayers()
            }, this.scene.onError)
        }, Frames.SETTLE_DELAY)
    }

    private cancelSettle() {
        if (this.settleTimer == null)
            return

        clearTimeout(this.settleTimer)
        this.settleTimer = null
    }

    private animateScene(frame: Frame, movingLegend?: Legend) {
        const { queue, layout, panels } = this.scene
        let isAnimating = queue.animate(frame.mouse, frame.now, frame.isInstant)

        isAnimating = this.updateOverlays(frame) || isAnimating

        if (movingLegend)
            layout.fit(movingLegend.getAnimatedReservedPaddings(frame.now))

        return panels.animate(frame.now, frame.window) || isAnimating
    }

    private shouldRender(isInstant: boolean, isAnimating: boolean, theme: ThemePalette) {
        return isInstant
               || isAnimating
               || this.wasAnimating
               || this.isSceneChanged(theme)
    }

    private isSceneChanged(theme: ThemePalette) {
        const last = this.lastRender
        const { queue, layout } = this.scene

        return last == null
               || last.version !== queue.version
               || last.theme !== theme
               || !Rectangle.same(last.window, layout.window)
               || !Rectangle.same(last.screen, layout.screen)
               || !Frames.samePanels(last.panels, this.scene.panels.list)
    }

    private getPanelStates(): PanelState[] {
        return this.scene.panels.list.map(panel => ({
            window: Rectangle.copy(panel.window),
            body: Rectangle.copy(panel.body)
        }))
    }

    private static samePanels(states: PanelState[], panels: Panel[]) {
        return states.length === panels.length
               && panels.every((panel, index) => {
                   const state = states[index]

                   return Rectangle.same(state.window, panel.window)
                          && Rectangle.same(state.body, panel.body)
               })
    }

    private updateOverlays(frame: Frame) {
        let isAnimating = false

        for (const overlay of this.scene.getOverlays())
            isAnimating = overlay.update(frame) || isAnimating

        return isAnimating
    }
}