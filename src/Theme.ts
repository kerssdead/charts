///<reference path="static/ThemeOptions.ts"/>
class Theme {
    static currentTheme = 0

    static text: string

    static background: string

    static line: string

    static lineAxis: string

    static lineActive: string

    static dropdownItemHoverColor: string

    static dropdownBorder: string

    static initialize(callback: Function, isDark?: Function) {
        if (window.matchMedia
            && window.matchMedia('(prefers-color-scheme: dark)').matches
            && (!isDark || isDark()))
            Theme.setTheme(1)
        else
            Theme.setTheme(0)

        window.matchMedia('(prefers-color-scheme: dark)')
              .addEventListener(Events.Change, event => {
                  Theme.setTheme(event.matches && (!isDark || isDark()) ? 1 : 0)
                  callback()
              })
    }

    static setTheme(index: number) {
        Theme.currentTheme = index

        Theme.text = ThemeOptions.colors[index]
        Theme.background = ThemeOptions.backgrounds[index]
        Theme.line = ThemeOptions.lines[index]
        Theme.lineAxis = ThemeOptions.lineAxes[index]
        Theme.lineActive = ThemeOptions.lineActives[index]
        Theme.dropdownItemHoverColor = Helper.adjustColor(Theme.background, index == 0 ? -50 : 50)
        Theme.dropdownBorder = ThemeOptions.dropdownBorders[index]
    }
}