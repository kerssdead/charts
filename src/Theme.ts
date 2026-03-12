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

    static function: Function | undefined

    static initialize(callback: Function, isDark?: Function) {
        if (!Theme.function && isDark)
            Theme.function = isDark

        if (!Theme.function || Theme.function())
            Theme.setTheme(ColorTheme.dark)
        else
            Theme.setTheme(ColorTheme.light)

        window.matchMedia('(prefers-color-scheme: dark)')
              .addEventListener(Events.Change, event => {
                  Theme.setTheme(event.matches && (!Theme.function || Theme.function()) ? ColorTheme.dark : ColorTheme.light)
                  callback()
              })
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
    }

    static reset() {
        this.function = undefined
    }
}

export default Theme