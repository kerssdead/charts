import { installChartEnvironment, removeChartEnvironment } from './ChartTestData'
import { rendererCalls } from './ChartRendererMock'

jest.mock('@/renderer/Renderer', () => jest.requireActual('./ChartRendererMock').mockRendererModule)

const installMotionPreference = () => {
    const environment = installChartEnvironment()
    const listeners = new Set<() => void>()
    const motion = {
        matches: false,
        addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
        removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener)
    }
    const theme = { matches: false, addEventListener() {}, removeEventListener() {} }

    Object.assign(globalThis, {
        matchMedia: (query: string) => query.includes('reduced-motion') ? motion : theme
    })

    return { ...environment, change: () => listeners.forEach(listener => listener()) }
}

afterEach(() => {
    jest.restoreAllMocks()
    removeChartEnvironment()
})

describe('Reacting to reduced motion preference', () => {
    it('Should apply settings again when the preference changes', () => {
        const { create, change } = installMotionPreference()

        create()
        rendererCalls.length = 0
        change()

        expect(rendererCalls)
            .toEqual(['apply'])
    })

    it('Should not react after destroy', () => {
        const { create, change } = installMotionPreference()
        const chart = create()

        chart.destroy()
        rendererCalls.length = 0
        change()

        expect(rendererCalls)
            .toEqual([])
    })

})