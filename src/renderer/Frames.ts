import AnimationFrame from '@/renderer/AnimationFrame'
import InputRouter from '@/renderer/InputRouter'
import Queue from '@/render/Queue'
import Layout from '@/renderer/Layout'
import ChartPanels from '@/renderer/ChartPanels'
import Overlay from '@/renderer/Overlay'
import Legend from '@/Legend'
import ChartSettings from '@/types/ChartSettings'
import Frame from '@/renderer/Frame'
import { ThemePalette } from '@/Theme'
import { guard } from '@/helpers/Errors'

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

export default class Frames {
    private readonly scene: FrameScene

    private readonly animationFrame: AnimationFrame

    private isClean: boolean = false

    private suspended: boolean = false

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

    private draw(timestamp: DOMHighResTimeStamp) {
        const { queue, layout, panels, input } = this.scene
        const settings = this.scene.getSettings()

        this.syncTheme()

        const theme = this.scene.getThemePalette()
        const isInstant = settings.staticMode || this.isClean

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

        let isAnimating = queue.animate(position, timestamp, isInstant)

        isAnimating = this.updateOverlays(frame) || isAnimating

        if (movingLegend)
            layout.fit(movingLegend.getCurrentReserved(timestamp))

        isAnimating = panels.animate(timestamp, window) || isAnimating
        isAnimating = queue.render(timestamp, window, screen, theme) || isAnimating

        if (isAnimating)
            this.request()
    }

    private updateOverlays(frame: Frame) {
        let isAnimating = false

        for (const overlay of this.scene.getOverlays())
            isAnimating = overlay.update(frame) || isAnimating

        return isAnimating
    }
}