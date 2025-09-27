///<reference path="static/ThemeOptions.ts"/>
class Theme {
    static currentTheme = 0

    static text = ThemeOptions.colors[0]

    static background = ThemeOptions.backgrounds[0]

    static line = ThemeOptions.lines[0]

    static lineAxis = ThemeOptions.lineAxises[0]

    static lineActive = ThemeOptions.lineActives[0]

    static initialize(callback: Function, isDark?: Function) {
        if (window.matchMedia
            && window.matchMedia('(prefers-color-scheme: dark)').matches
            && (!isDark || isDark()))
            Theme.setTheme(1)

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
        Theme.lineAxis = ThemeOptions.lineAxises[index]
        Theme.lineActive = ThemeOptions.lineActives[index]
    }
}