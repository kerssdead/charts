import { adjustColor, hexToRgb, withAlpha } from '@/helpers/Color'
import ThemeOptions from '@/static/ThemeOptions'
import { ErrorType, Events } from '@/static/Enums'
import fail from '@/helpers/Errors'

export enum ColorTheme {
    light = 0,
    dark = 1
}

class Theme {
    static currentTheme = ColorTheme.light

    static text: string

    static background: string

    static line: string

    static lineAxis: string

    static dropdownItemHoverColor: string

    static dropdownBorder: string

    static canvasBackground: string

    static other: string

    static canvasBackgroundInt: number

    static contextMenuBackground: string

    static contextMenuButton: string

    static contextMenuButtonHover: string

    static media: MediaQueryList | undefined

    static initialize(callback: () => void, isDark?: () => boolean) {
        Theme.media ??= window.matchMedia('(prefers-color-scheme: dark)')

        Theme.update(isDark)

        Theme.media.addEventListener(Events.Change, callback)
    }

    static detach(callback: () => void) {
        Theme.media?.removeEventListener(Events.Change, callback)
    }

    static setTheme(index: ColorTheme) {
        if (Theme.text != undefined && index == Theme.currentTheme)
            return

        Theme.currentTheme = index

        Object.assign(Theme, ThemeOptions.palettes[index])

        Theme.dropdownItemHoverColor = adjustColor(Theme.background, index == ColorTheme.light ? -50 : 50)

        const { r, g, b } = hexToRgb(Theme.canvasBackground) ?? fail(ErrorType.InvalidHexColor)
        Theme.canvasBackgroundInt = new Uint32Array(new Uint8ClampedArray([r, g, b, 255]).buffer)[0]
        Theme.contextMenuBackground = withAlpha(Theme.background, ThemeOptions.contextMenuOpacity)
        Theme.contextMenuButton = withAlpha(Theme.dropdownItemHoverColor, 0)
        Theme.contextMenuButtonHover = withAlpha(Theme.dropdownItemHoverColor, 1)
    }

    static hoverBackground(hover: number) {
        const fullAdjustment = Theme.currentTheme == ColorTheme.dark ? 25 : -25

        return adjustColor(Theme.canvasBackground, Math.round(fullAdjustment * hover))
    }

    static update(isDark?: () => boolean) {
        const isDarkTheme = isDark ? isDark() : Theme.media?.matches

        Theme.setTheme(isDarkTheme ? ColorTheme.dark : ColorTheme.light)
    }
}

export default Theme