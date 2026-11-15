import ChartSettings from '@/types/ChartSettings'
import Theme, { ColorTheme } from '@/Theme'
import Renderer from '@/renderer/Renderer'
import Debug from '@/helpers/Debug'
import { normalize } from '@/charts/Settings'
import ViewState from '@/charts/ViewState'
import ChartFailure from '@/ui/ChartFailure'
import { applyFallbackHostSize, applyHostSize } from '@/helpers/HostSize'
import CanvasHost from '@/renderer/CanvasHost'
import RendererTheme from '@/renderer/RendererTheme'

// todo: add public api

export default class Chart {
    private isDestroyed: boolean = false

    private isSuspended: boolean = false

    private suspendedTheme: ColorTheme = ColorTheme.light

    private readonly theme = new Theme()

    private readonly rendererTheme: RendererTheme = {
        getPalette: () => this.theme.palette,
        sync: () => this.theme.updatePalette(this.settings.isDarkThemeFunction)
    }

    private source!: ChartSettings

    private settings!: ChartSettings

    private readonly element: HTMLElement

    private readonly failure: ChartFailure

    private host!: CanvasHost

    private renderer!: Renderer

    private viewState!: ViewState

    private readonly onThemeChange = () => {
        this.applySettings(this.source)
    }

    constructor(element: HTMLElement, settings: ChartSettings) {
        this.element = element
        this.failure = new ChartFailure(element)

        this.start(settings)
    }

    render() {
        if (this.isDestroyed || this.failure.isActive)
            return

        this.renderer.render()
    }

    destroy() {
        this.failure.clear()

        if (this.isDestroyed)
            return

        this.isDestroyed = true

        this.stop()
    }

    private start(settings: ChartSettings) {
        const element = this.element

        this.source = settings

        try {
            this.settings = normalize(settings, element)
            this.viewState = new ViewState()
            this.viewState.apply(this.settings)

            this.bindMenuActions()
            applyHostSize(element, this.settings)
            applyFallbackHostSize(element, this.settings)

            this.host = new CanvasHost(element, {
                onResize: (width, height, ratio) => this.resize(width, height, ratio),
                onDetach: () => this.suspend(),
                onAttach: () => this.resume()
            })

            this.theme.initialize(this.onThemeChange, this.settings.isDarkThemeFunction)

            this.renderer = new Renderer(
                this.host.canvas,
                this.viewState,
                this.rendererTheme,
                error => this.handleError(error)
            )
            this.renderer.apply(this.settings)

            Debug.log(settings, this.settings, this.host.canvas, this.theme.colorTheme)

            if (!this.host.isAttached)
                this.suspend()
        } catch (error) {
            this.handleError(error)
        }
    }

    private stop() {
        this.host?.destroy()

        this.theme.detach()

        this.renderer?.destroy()
    }

    private guard(action: () => void) {
        if (this.isDestroyed || this.failure.isActive)
            return

        try {
            action()
        } catch (error) {
            this.handleError(error)
        }
    }

    private handleError(error: unknown) {
        if (this.isDestroyed || this.failure.isActive)
            return

        try {
            this.stop()
        } catch (stopError) {
            console.error(stopError)
        }

        this.failure.report(error, {
            element: this.element,
            size: this.host?.size ?? { width: 0, height: 0 },
            theme: ColorTheme[this.theme.colorTheme],
            input: this.source,
            settings: this.settings
        }, this.source.onError)
    }

    private recover(settings: ChartSettings) {
        this.failure.clear()

        this.isSuspended = false

        this.start(settings)
    }

    applySettings(settings: ChartSettings) {
        if (this.isDestroyed)
            return

        if (this.failure.isActive)
            this.recover(settings)
        else
            this.guard(() => this.update(settings))
    }

    private update(settings: ChartSettings) {
        this.source = settings
        this.settings = normalize(settings, this.element)
        this.viewState.apply(this.settings)

        this.bindMenuActions()
        applyHostSize(this.element, this.settings)

        this.theme.updatePalette(this.settings.isDarkThemeFunction)
        this.renderer.apply(this.settings)

        Debug.log(settings, this.settings, this.host.canvas, this.theme.colorTheme)
    }

    private bindMenuActions() {
        for (const item of this.settings.contextMenu ?? []) {
            const id = item.id

            if (id === undefined)
                continue

            item.action ??= data => {
                this.element.dispatchEvent(new CustomEvent(id, { detail: data }))
            }
        }
    }

    private resize(width: number, height: number, ratio: number) {
        this.guard(() => {
            this.renderer.resize(width, height, ratio)
            this.renderer.render()
        })
    }

    private suspend() {
        if (this.isSuspended || this.isDestroyed)
            return

        this.isSuspended = true

        this.theme.updatePalette(this.settings.isDarkThemeFunction)
        this.suspendedTheme = this.theme.colorTheme

        this.theme.detach()
        this.renderer.suspend()
    }

    private resume() {
        if (!this.isSuspended || this.isDestroyed)
            return

        this.isSuspended = false

        this.theme.initialize(this.onThemeChange, this.settings.isDarkThemeFunction)
        this.renderer.resume()

        if (this.theme.colorTheme !== this.suspendedTheme)
            this.onThemeChange()
    }
}