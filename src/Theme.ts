import * as Helper from 'Helper'
import ThemeOptions from 'static/ThemeOptions'
import { Events } from 'static/Enums'

enum ColorTheme {
    light = 0,
    dark = 1
}

class Theme {
    static currentTheme = 0

    static text: string

    static background: string

    static line: string

    static lineAxis: string

    static lineActive: string

    static dropdownItemHoverColor: string

    static dropdownBorder: string

    static canvasBackground: string

    static canvasBackgroundInt: number

    static contextMenuBackground: string

    static contextMenuButton: string

    static contextMenuButtonHover: string

    static function: Function | undefined

    static media: MediaQueryList | undefined

    static listeners: Map<Function, (event: MediaQueryListEvent) => void> = new Map()

    static initialize(callback: Function, isDark?: Function) {
        if (!Theme.function && isDark)
            Theme.function = isDark

        if (!Theme.function || Theme.function())
            Theme.setTheme(ColorTheme.dark)
        else
            Theme.setTheme(ColorTheme.light)

        if (Theme.listeners.has(callback))
            return

        const listener = (event: MediaQueryListEvent) => {
            Theme.setTheme(event.matches && (!Theme.function || Theme.function()) ? ColorTheme.dark : ColorTheme.light)
            callback()
        }

        Theme.media ??= window.matchMedia('(prefers-color-scheme: dark)')
        Theme.media.addEventListener(Events.Change, listener)

        Theme.listeners.set(callback, listener)
    }

    static detach(callback: Function) {
        const listener = Theme.listeners.get(callback)

        if (!listener)
            return

        Theme.media?.removeEventListener(Events.Change, listener)
        Theme.listeners.delete(callback)
    }

    static setTheme(index: ColorTheme) {
        Theme.currentTheme = index

        Theme.text = ThemeOptions.colors[index]
        Theme.background = ThemeOptions.backgrounds[index]
        Theme.line = ThemeOptions.lines[index]
        Theme.lineAxis = ThemeOptions.lineAxes[index]
        Theme.lineActive = ThemeOptions.lineActives[index]
        Theme.dropdownItemHoverColor = Helper.adjustColor(Theme.background, index == ColorTheme.light ? -50 : 50)
        Theme.dropdownBorder = ThemeOptions.dropdownBorders[index]
        Theme.canvasBackground = ThemeOptions.canvasBackgrounds[index]
        Theme.canvasBackgroundInt = Number(`0xff${ Theme.canvasBackground.slice(1) }`)
        Theme.contextMenuBackground = Theme.withAlpha(Theme.background, ThemeOptions.contextMenuOpacities[index])
        Theme.contextMenuButton = Theme.withAlpha(Theme.dropdownItemHoverColor, 0)
        Theme.contextMenuButtonHover = Theme.withAlpha(Theme.dropdownItemHoverColor, 1)
    }

    static withAlpha(color: string, alpha: number) {
        const value = Math.round(Math.min(Math.max(alpha, 0), 1) * 255)

        return color.slice(0, 7) + value.toString(16).padStart(2, '0')
    }

    static reset() {
        this.function = undefined
    }
}

export default Theme