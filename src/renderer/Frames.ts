import AnimationFrame from '@/renderer/AnimationFrame'
import InputRouter from '@/renderer/InputRouter'
import Queue from '@/render/Queue'
import Layout from '@/renderer/Layout'
import ChartPanels from '@/renderer/ChartPanels'
import Overlay from '@/renderer/Overlay'
import Legend from '@/Legend'
import ChartSettings from '@/types/ChartSettings'
import Frame from '@/renderer/Frame'
import Panel from '@/types/Panel'
import RectangleDimensions from '@/types/RectangleDimensions'
import { copyRect, sameRect } from '@/helpers/Geometry'
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
    private readonly scene: FrameScene

    private readonly animationFrame: AnimationFrame

    private isClean: boolean = false

    private suspended: boolean = false

    private wasAnimating: boolean = false

    private lastRender: FrameRenderState | null = null

    get isSuspended() {
        return this.suspended
    }

    constructor(scene: FrameScene) {
        this.scene = scene
        this.animationFrame = new AnimationFrame(timestamp => guard(() => this.draw(timestamp), scene.onError))
    }

    request() {
        if (!this.suspended)
            this.animationFrame.request()
    }

    cancel() {
        this.animationFrame.cancel()
    }

    drawNow() {
        if (this.suspended)
            return

        this.cancel()
        this.lastRender = null

        this.draw(performance.now())
    }

    drawClean() {
        this.isClean = true

        this.cancel()
        this.draw(performance.now())

        this.isClean = false

        this.request()
    }

    suspend() {
        this.suspended = true

        this.cancel()
    }

    resume() {
        this.suspended = false

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
            isAnimating = queue.render(timestamp, window, screen, theme) || isAnimating

            this.lastRender = {
                version: queue.version,
                theme,
                window: copyRect(window),
                screen: copyRect(screen),
                panels: this.getPanelStates()
            }
        }

        this.wasAnimating = isAnimating

        if (isAnimating)
            this.request()
    }

    private animateScene(frame: Frame, movingLegend?: Legend) {
        const { queue, layout, panels } = this.scene
        let isAnimating = queue.animate(frame.mouse, frame.now, frame.isInstant)

        isAnimating = this.updateOverlays(frame) || isAnimating

        if (movingLegend)
            layout.fit(movingLegend.getCurrentReserved(frame.now))

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
               || !sameRect(last.window, layout.window)
               || !sameRect(last.screen, layout.screen)
               || !Frames.samePanels(last.panels, this.scene.panels.list)
    }

    private getPanelStates(): PanelState[] {
        return this.scene.panels.list.map(panel => ({
            window: copyRect(panel.window),
            body: copyRect(panel.body)
        }))
    }

    private static samePanels(states: PanelState[], panels: Panel[]) {
        return states.length === panels.length
               && panels.every((panel, index) => {
                   const state = states[index]

                   return sameRect(state.window, panel.window)
                          && sameRect(state.body, panel.body)
               })
    }

    private updateOverlays(frame: Frame) {
        let isAnimating = false

        for (const overlay of this.scene.getOverlays())
            isAnimating = overlay.update(frame) || isAnimating

        return isAnimating
    }
}