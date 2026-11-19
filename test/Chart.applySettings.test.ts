import { getFontFamily, setFontFamily, SYSTEM_FONT_FAMILY } from '@/static/Typography'
import { getLocale, setLocalization } from '@/static/Localization'
import Chart from '@/Chart'
import ChartSettings from '@/types/ChartSettings'
import TextResources from '@/static/TextResources'
import { Tag } from '@/static/Enums'
import { FakeElement, installFakeDocument } from './FakeDocument'

const BROKEN_TITLE = 'Broken'

const mockThemeGetters: (() => { isDark: boolean })[] = []

jest.mock('@/renderer/Renderer', () => ({
    __esModule: true,
    default: class {
        constructor(
            _canvas: unknown,
            _viewState: unknown,
            theme: { getPalette: () => { isDark: boolean } }
        ) {
            mockThemeGetters.push(theme.getPalette)
        }

        apply(settings: { title?: string }) {
            if (settings.title === 'Broken')
                throw new Error('Broken')
        }

        destroy() {}

        suspend() {}

        resume() {}

        render() {}

        resize() {}
    }
}))

const settings = (title: string, onError?: ChartSettings['onError']) => {
    return { title, data: { values: [] }, onError } as unknown as ChartSettings
}

let host: FakeElement

beforeEach(() => {
    const body = installFakeDocument()
    const media = { matches: false, addEventListener() {}, removeEventListener() {} }

    host = new FakeElement(Tag.Div)
    body.appendChild(host)
    mockThemeGetters.length = 0

    Object.assign(globalThis, {
        window: { devicePixelRatio: 1, matchMedia: () => media },
        matchMedia: () => media,
        ResizeObserver: class {
            observe() {}

            disconnect() {}
        }
    })

    jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
    setLocalization(undefined, undefined)
    setFontFamily(undefined)
    jest.restoreAllMocks()
})

const create = (initial: ChartSettings) => {
    return new Chart(host as unknown as HTMLElement, initial)
}

const children = () => host.elements.map(element => element.tagName)

describe('Applying settings', () => {
    it('Should recover when the chart failed to create', () => {
        const chart = create(settings(BROKEN_TITLE))

        chart.applySettings(settings('Fixed'))

        expect(children())
            .toEqual([Tag.Canvas])
    })

    it('Should recover when previous settings failed', () => {
        const chart = create(settings('Working'))

        chart.applySettings(settings(BROKEN_TITLE))
        chart.applySettings(settings('Fixed'))

        expect(children())
            .toEqual([Tag.Canvas])
    })

    it('Should show one error message when recovery fails again', () => {
        const chart = create(settings(BROKEN_TITLE))

        chart.applySettings(settings(BROKEN_TITLE))

        expect(children())
            .toEqual([Tag.Div])
        expect(host.text)
            .toBe(TextResources.somethingWentWrong)
    })

    it('Should recover without an error message when onError applies fixed settings', () => {
        const chart: Chart = create(settings('Working'))

        chart.applySettings(settings(BROKEN_TITLE, () => chart.applySettings(settings('Fixed'))))

        expect(children())
            .toEqual([Tag.Canvas])
    })

    it('Should not show an error message when onError destroys the chart', () => {
        const chart: Chart = create(settings('Working'))

        chart.applySettings(settings(BROKEN_TITLE, () => chart.destroy()))

        expect(children())
            .toEqual([])
    })

    it('Should refresh the chart palette when settings are applied', () => {
        let isDark = false
        const chart = create({
            title: 'Working',
            data: { values: [] },
            isDarkThemeFunction: () => isDark
        } as unknown as ChartSettings)

        isDark = true
        chart.applySettings({
            title: 'Working',
            data: { values: [] },
            isDarkThemeFunction: () => isDark
        } as unknown as ChartSettings)

        expect(mockThemeGetters.at(-1)?.().isDark)
            .toBe(true)
    })

    it('Should do nothing after the chart is destroyed', () => {
        const chart = create(settings(BROKEN_TITLE))

        chart.destroy()
        chart.applySettings(settings('Fixed'))

        expect(children())
            .toEqual([])
    })

    it('Should apply locale and custom strings', () => {
        const chart = create(settings('Working'))

        chart.applySettings({ ...settings('Working'), locale: 'fr', strings: { copy: 'Dupliquer' } })

        expect([TextResources.reset, TextResources.copy, getLocale()])
            .toEqual(['Réinitialiser', 'Dupliquer', 'fr'])
    })

    it('Should reset locale when it is removed from settings', () => {
        const chart = create({ ...settings('Working'), locale: 'fr' })

        chart.applySettings(settings('Working'))

        expect([TextResources.reset, getLocale()])
            .toEqual(['Reset', undefined])
    })

    it('Should use the font family from settings', () => {
        create({ ...settings('Working'), fontFamily: 'Georgia' })

        expect(getFontFamily())
            .toBe('Georgia')
    })

    it('Should inherit the host font family when settings have none', () => {
        Object.assign(globalThis, { getComputedStyle: () => ({ fontFamily: '"Inter", sans-serif' }) })

        create(settings('Working'))

        expect(getFontFamily())
            .toBe('"Inter", sans-serif')
    })

    it('Should prefer the font family from settings over the host font', () => {
        Object.assign(globalThis, { getComputedStyle: () => ({ fontFamily: 'Inter' }) })

        create({ ...settings('Working'), fontFamily: 'Georgia' })

        expect(getFontFamily())
            .toBe('Georgia')
    })

    it('Should use the system font family when the host has none', () => {
        create(settings('Working'))

        expect(getFontFamily())
            .toBe(SYSTEM_FONT_FAMILY)
    })
})