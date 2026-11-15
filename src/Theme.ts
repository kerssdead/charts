import { adjustColor, hexToRgb, withAlpha } from '@/helpers/Color'
import ThemeOptions from '@/static/ThemeOptions'
import { ErrorType, Events } from '@/static/Enums'
import fail from '@/helpers/Errors'

export enum ColorTheme {
    light = 0,
    dark = 1
}

export type ThemePalette = Readonly<{
    isDark: boolean

    text: string

    background: string

    line: string

    lineAxis: string

    dropdownItemHoverColor: string

    dropdownBorder: string

    canvasBackground: string

    other: string

    canvasBackgroundInt: number

    floatingBackground: string

    contextMenuButton: string

    contextMenuButtonHover: string
}>

const HOVER_ADJUSTMENT = 25

export function createTheme(index: ColorTheme): ThemePalette {
    const palette = ThemeOptions.palettes[index]
    const { floatingOpacity, ...colors } = palette
    const dropdownItemHoverColor = adjustColor(palette.background, index === ColorTheme.light ? -50 : 50)
    const { r, g, b } = hexToRgb(palette.canvasBackground) ?? fail(ErrorType.InvalidHexColor)

    return Object.freeze({
        isDark: index === ColorTheme.dark,
        ...colors,
        dropdownItemHoverColor,
        canvasBackgroundInt: new Uint32Array(new Uint8ClampedArray([r, g, b, 255]).buffer)[0],
        floatingBackground: withAlpha(palette.background, floatingOpacity),
        contextMenuButton: withAlpha(dropdownItemHoverColor, 0),
        contextMenuButtonHover: withAlpha(dropdownItemHoverColor, 1)
    })
}

export const LIGHT_THEME = createTheme(ColorTheme.light)

export function hoverBackground(theme: ThemePalette, hover: number) {
    const fullAdjustment = theme.isDark ? HOVER_ADJUSTMENT : -HOVER_ADJUSTMENT

    return adjustColor(theme.canvasBackground, Math.round(fullAdjustment * hover))
}

export default class Theme {
    private media: MediaQueryList | undefined

    private isDarkThemeFunction: (() => boolean) | undefined

    private onChange!: () => void

    private isAttached: boolean = false

    private currentColorTheme: ColorTheme = ColorTheme.light

    private currentPalette: ThemePalette = LIGHT_THEME

    get palette(): ThemePalette {
        return this.currentPalette
    }

    get colorTheme(): ColorTheme {
        return this.currentColorTheme
    }

    initialize(onChange: () => void, isDarkThemeFunction?: () => boolean) {
        this.onChange = onChange
        this.isDarkThemeFunction = isDarkThemeFunction
        this.media ??= window.matchMedia('(prefers-color-scheme: dark)')

        if (!this.isAttached) {
            this.media.addEventListener(Events.Change, this.handleChange)
            this.isAttached = true
        }

        this.updatePalette(isDarkThemeFunction)
    }

    detach() {
        if (!this.isAttached)
            return

        this.media?.removeEventListener(Events.Change, this.handleChange)
        this.isAttached = false
    }

    updatePalette(isDarkThemeFunction: (() => boolean) | undefined) {
        this.isDarkThemeFunction = isDarkThemeFunction

        const isDarkTheme = isDarkThemeFunction ? isDarkThemeFunction() : this.media?.matches
        const colorTheme = isDarkTheme ? ColorTheme.dark : ColorTheme.light

        if (colorTheme === this.currentColorTheme)
            return false

        this.currentColorTheme = colorTheme
        this.currentPalette = createTheme(colorTheme)

        return true
    }

    private readonly handleChange = () => {
        this.updatePalette(this.isDarkThemeFunction)
        this.onChange()
    }
}