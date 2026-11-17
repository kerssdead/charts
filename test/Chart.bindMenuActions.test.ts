import { chartSettings, installChartEnvironment, removeChartEnvironment } from './ChartTestData'
import { rendererSettings } from './ChartRendererMock'

jest.mock('@/renderer/Renderer', () => jest.requireActual('./ChartRendererMock').mockRendererModule)

afterEach(() => {
    removeChartEnvironment()
})

const appliedMenu = () => rendererSettings.at(-1)?.contextMenu as { action?: (data: unknown) => void }[]

describe('Binding menu actions', () => {
    it('Should dispatch a custom event with the item id for items without action', () => {
        const { host, create } = installChartEnvironment()
        const dispatchEvent = jest.fn()

        Object.assign(host, { dispatchEvent })
        create(chartSettings({ contextMenu: [{ id: 'custom', text: 'Custom' }] } as never))
        appliedMenu()[0].action?.({ value: 1 })

        expect(dispatchEvent.mock.calls[0][0].type)
            .toBe('custom')
        expect(dispatchEvent.mock.calls[0][0].detail)
            .toEqual({ value: 1 })
    })

    it('Should keep the existing item action', () => {
        const { create } = installChartEnvironment()
        const action = jest.fn()

        create(chartSettings({ contextMenu: [{ id: 'custom', text: 'Custom', action }] } as never))

        expect(appliedMenu()[0].action)
            .toBe(action)
    })

    it('Should skip items without id', () => {
        const { create } = installChartEnvironment()

        create(chartSettings({ contextMenu: [{ text: 'None' }] } as never))

        expect(appliedMenu()[0].action)
            .toBeUndefined()
    })
})
