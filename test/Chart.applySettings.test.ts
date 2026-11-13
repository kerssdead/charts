import Chart from '@/Chart'
import ChartSettings from '@/types/ChartSettings'
import TextResources from '@/static/TextResources'
import { Tag } from '@/static/Enums'
import { FakeElement, installFakeDocument } from './FakeDocument'

const BROKEN_TITLE = 'Broken'

jest.mock('@/renderer/Renderer', () => ({
    __esModule: true,
    default: class {
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

    it('Should do nothing after the chart is destroyed', () => {
        const chart = create(settings(BROKEN_TITLE))

        chart.destroy()
        chart.applySettings(settings('Fixed'))

        expect(children())
            .toEqual([])
    })
})