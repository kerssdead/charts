import { adjustColor, hexToRgb, withAlpha } from '@/helpers/Color'
import ThemeOptions from '@/static/ThemeOptions'
import { Events } from '@/static/Enums'

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

    static listeners: Map<() => void, (event: MediaQueryListEvent) => void> = new Map()

    static initialize(callback: () => void, isDark?: () => boolean) {
        Theme.media ??= window.matchMedia('(prefers-color-scheme: dark)')

        Theme.update(isDark)

        if (Theme.listeners.has(callback))
            return

        const listener = () => callback()

        Theme.media.addEventListener(Events.Change, listener)

        Theme.listeners.set(callback, listener)
    }

    static detach(callback: () => void) {
        const listener = Theme.listeners.get(callback)

        if (!listener)
            return

        Theme.media?.removeEventListener(Events.Change, listener)
        Theme.listeners.delete(callback)
    }

    static setTheme(index: ColorTheme) {
        if (Theme.text != undefined && index == Theme.currentTheme)
            return

        Theme.currentTheme = index

        Object.assign(Theme, ThemeOptions.palettes[index])

        Theme.dropdownItemHoverColor = adjustColor(Theme.background, index == ColorTheme.light ? -50 : 50)

        const { r, g, b } = hexToRgb(Theme.canvasBackground)!
        Theme.canvasBackgroundInt = new Uint32Array(new Uint8ClampedArray([r, g, b, 255]).buffer)[0]
        Theme.contextMenuBackground = withAlpha(Theme.background, ThemeOptions.contextMenuOpacity)
        Theme.contextMenuButton = withAlpha(Theme.dropdownItemHoverColor, 0)
        Theme.contextMenuButtonHover = withAlpha(Theme.dropdownItemHoverColor, 1)
    }

    static hoverBackground(hover: number) {
        return adjustColor(Theme.canvasBackground, Math.round(-25 * hover))
    }

    static update(isDark?: () => boolean) {
        const isDarkTheme = isDark ? isDark() : Theme.media?.matches

        Theme.setTheme(isDarkTheme ? ColorTheme.dark : ColorTheme.light)
    }
}

export default Theme