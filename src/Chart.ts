import ChartSettings from '@/types/ChartSettings'
import ChartOptions from '@/types/ChartOptions'
import Theme, { ColorTheme } from '@/Theme'
import Renderer from '@/renderer/Renderer'
import Debug from '@/helpers/Debug'
import { setFontFamily } from '@/static/Typography'
import { clearTextWidths } from '@/helpers/Text'
import { setLocalization } from '@/static/Localization'
import { normalize } from '@/charts/Settings'
import TableHint from '@/ui/TableHint'
import { isMenuEnabled } from '@/renderer/ChartMenu'
import { getAccessibleName } from '@/charts/AccessibleName'
import ViewState from '@/charts/ViewState'
import ChartFailure from '@/ui/ChartFailure'
import { applyFallbackHostSize, applyHostSize } from '@/helpers/HostSize'
import CanvasHost from '@/renderer/CanvasHost'
import { Attribute, FontEvents } from '@/static/Enums'
import { onReducedMotionChange } from '@/helpers/Motion'
import RendererTheme from '@/renderer/RendererTheme'

export default class Chart {
    private isDestroyed = false

    private isSuspended = false

    private suspendedTheme: ColorTheme = ColorTheme.light

    private readonly theme = new Theme()

    private readonly rendererTheme: RendererTheme = {
        getPalette: () => this.theme.palette,
        sync: () => this.theme.updatePalette(this.settings.isDarkThemeFunction)
    }

    private source!: ChartOptions

    private settings!: ChartSettings

    private readonly failure: ChartFailure

    private host!: CanvasHost

    private tableHint!: TableHint

    private renderer!: Renderer

    private viewState!: ViewState

    private readonly onThemeChange = () => {
        this.applySettings(this.source)
    }

    private readonly onFontsLoaded = () => {
        if (this.isDestroyed || this.failure.isActive)
            return

        clearTextWidths()

        this.applySettings(this.source)
    }

    private readonly onMotionPreferenceChange = () => {
        if (this.isDestroyed || this.failure.isActive)
            return

        this.applySettings(this.source)
    }

    private removeEnvironmentListeners: (() => void) | null = null

    constructor(private readonly element: HTMLElement, settings: ChartOptions) {
        this.failure = new ChartFailure(element)

        this.listenToEnvironment()
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

    private listenToEnvironment() {
        if (this.removeEnvironmentListeners)
            return

        const fonts = document.fonts
        const stopListeningToMotionPreference = onReducedMotionChange(this.onMotionPreferenceChange)

        fonts?.addEventListener(FontEvents.LoadingDone, this.onFontsLoaded)

        this.removeEnvironmentListeners = () => {
            fonts?.removeEventListener(FontEvents.LoadingDone, this.onFontsLoaded)
            stopListeningToMotionPreference()
        }
    }

    private stopListeningToEnvironment() {
        this.removeEnvironmentListeners?.()
        this.removeEnvironmentListeners = null
    }

    private start(settings: ChartOptions) {
        const element = this.element

        this.source = settings

        try {
            this.viewState = new ViewState()

            this.normalizeAndApply(settings)
            applyFallbackHostSize(element, this.settings)

            this.host = new CanvasHost(element, {
                onResize: (width, height, ratio) => this.resize(width, height, ratio),
                onDetach: () => this.suspend(),
                onAttach: () => this.resume()
            })

            this.tableHint = new TableHint(element, this.host.canvas)
            this.applyAccessibleName()

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
        this.stopListeningToEnvironment()
        this.tableHint?.remove()
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

    private recover(settings: ChartOptions) {
        this.failure.clear()

        this.isSuspended = false

        this.listenToEnvironment()
        this.start(settings)
    }

    applySettings(settings: ChartOptions) {
        if (this.isDestroyed)
            return

        if (this.failure.isActive)
            this.recover(settings)
        else
            this.guard(() => this.update(settings))
    }

    private update(settings: ChartOptions) {
        this.source = settings

        this.normalizeAndApply(settings)
        this.applyAccessibleName()

        this.theme.updatePalette(this.settings.isDarkThemeFunction)
        this.renderer.apply(this.settings)

        Debug.log(settings, this.settings, this.host.canvas, this.theme.colorTheme)
    }

    private normalizeAndApply(settings: ChartOptions) {
        setLocalization(settings.locale, settings.strings)
        setFontFamily(settings.fontFamily || getComputedStyle(this.element).fontFamily)

        this.settings = normalize(settings, this.element)
        this.viewState.apply(this.settings)

        this.bindMenuActions()
        applyHostSize(this.element, this.settings)
    }

    private applyAccessibleName() {
        this.host.canvas.setAttribute(Attribute.AriaLabel, getAccessibleName(this.settings))
        this.tableHint.apply(isMenuEnabled(this.settings))
        this.applyKeyboardFocus()
    }

    private applyKeyboardFocus() {
        if (this.settings.disableInteractions)
            this.host.canvas.removeAttribute(Attribute.TabIndex)
        else
            this.host.canvas.setAttribute(Attribute.TabIndex, '0')
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

        this.stopListeningToEnvironment()
        this.theme.detach()
        this.renderer.suspend()
    }

    private resume() {
        if (!this.isSuspended || this.isDestroyed)
            return

        this.isSuspended = false

        this.listenToEnvironment()
        this.theme.initialize(this.onThemeChange, this.settings.isDarkThemeFunction)
        this.renderer.resume()

        if (this.theme.colorTheme !== this.suspendedTheme)
            this.onThemeChange()
    }
}