type Palette = {
    text: string

    background: string

    line: string

    lineAxis: string

    dropdownBorder: string

    canvasBackground: string

    other: string

    floatingOpacity: number
}

class ThemeOptions {
    static readonly palettes: Palette[] = [
        {
            text: '#000000',
            background: '#f7f7f7',
            line: '#000000',
            lineAxis: '#e0e0e0',
            dropdownBorder: '#bcbcbc',
            canvasBackground: '#ffffff',
            other: '#9e9e9e',
            floatingOpacity: .5
        },
        {
            text: '#ffffff',
            background: '#222222',
            line: '#eeeeee',
            lineAxis: '#434343',
            dropdownBorder: '#7e7e7e',
            canvasBackground: '#222222',
            other: '#757575',
            floatingOpacity: .45
        }
    ]
}

export default ThemeOptions