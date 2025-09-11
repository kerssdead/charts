///<reference path="ThemeOptions.ts"/>
class Theme {
    static text = ThemeOptions.colors[0]

    static background = ThemeOptions.backgrounds[0]

    static line = ThemeOptions.lines[0]

    static lineAxis = ThemeOptions.lineAxises[0]

    static lineActive = ThemeOptions.lineActives[0]

    static initialize() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
            Theme.setTheme(1)

        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener(Events.Change, event => Theme.setTheme(event.matches ? 1 : 0))
    }

    static setTheme(index: number) {
        Theme.text = ThemeOptions.colors[index]
        Theme.background = ThemeOptions.backgrounds[index]
        Theme.line = ThemeOptions.lines[index]
        Theme.lineAxis = ThemeOptions.lineAxises[index]
        Theme.lineActive = ThemeOptions.lineActives[index]
    }
}