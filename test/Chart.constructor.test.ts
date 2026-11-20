import Chart from '@/Chart'
import ChartOptions from '@/types/ChartOptions'
import { Tag } from '@/static/Enums'
import { FakeElement, installFakeDocument } from './FakeDocument'

type MockRendererTheme = {
    getPalette: () => { isDark: boolean }
    sync: () => boolean
}

const mockRendererThemes: MockRendererTheme[] = []

jest.mock('@/renderer/Renderer', () => ({
    __esModule: true,
    default: class {
        constructor(_canvas: unknown, _viewState: unknown, theme: MockRendererTheme) {
            mockRendererThemes.push(theme)
        }

        apply() {}

        destroy() {}

        suspend() {}

        resume() {}

        render() {}

        resize() {}
    }
}))

const settings = (isDarkThemeFunction: () => boolean = () => false) => {
    return {
        title: 'Chart',
        data: { values: [] },
        isDarkThemeFunction
    } as unknown as ChartOptions
}

let host: FakeElement

beforeEach(() => {
    const body = installFakeDocument()
    const media = { matches: false, addEventListener() {}, removeEventListener() {} }

    host = new FakeElement(Tag.Div)
    body.appendChild(host)
    mockRendererThemes.length = 0

    Object.assign(globalThis, {
        window: { devicePixelRatio: 1, matchMedia: () => media },
        matchMedia: () => media,
        ResizeObserver: class {
            observe() {}

            disconnect() {}
        }
    })
})

afterEach(() => {
    for (const name of ['document', 'window', 'matchMedia', 'ResizeObserver'])
        delete (globalThis as Record<string, unknown>)[name]
})

describe('Keeping chart themes independent', () => {
    it('Should give each chart its own palette', () => {
        new Chart(host as unknown as HTMLElement, settings(() => true))
        new Chart(host as unknown as HTMLElement, settings(() => false))

        expect(mockRendererThemes.map(theme => theme.getPalette().isDark))
            .toEqual([true, false])
    })

    it('Should sync the palette through the renderer theme', () => {
        let isDark = false

        new Chart(host as unknown as HTMLElement, settings(() => isDark))

        const theme = mockRendererThemes[0]

        isDark = true

        expect(theme.sync())
            .toBe(true)
        expect(theme.getPalette().isDark)
            .toBe(true)
    })
})