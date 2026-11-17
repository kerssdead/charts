import {
    chartSettings,
    installChartEnvironment,
    removeChartEnvironment
} from './ChartTestData'
import { rendererCalls } from './ChartRendererMock'

jest.mock('@/renderer/Renderer', () => jest.requireActual('./ChartRendererMock').mockRendererModule)

afterEach(() => {
    removeChartEnvironment()
})

const detachAndAttach = ({ canvas, host, observer }: ReturnType<typeof installChartEnvironment>) => {
    const target = canvas()

    target.remove()
    observer().callback([])
    host.appendChild(target)
}

describe('Resuming chart', () => {
    it('Should not resume a chart that is not suspended', () => {
        const { observer, create } = installChartEnvironment()

        create()
        observer().callback([])

        expect(rendererCalls)
            .not.toContain('resume')
    })

    it('Should not suspend twice', () => {
        const { canvas, observer, create } = installChartEnvironment()

        create()
        canvas().remove()
        observer().callback([])
        observer().callback([])

        expect(rendererCalls.filter(call => call === 'suspend'))
            .toHaveLength(1)
    })

    it('Should apply settings again when the theme changed while suspended', () => {
        const environment = installChartEnvironment()

        environment.create()
        detachAndAttach(environment)
        environment.media.matches = true
        rendererCalls.length = 0
        environment.observer().callback([])

        expect(rendererCalls)
            .toEqual(['resume', 'apply'])
    })

    it('Should not apply settings again when the theme stayed the same', () => {
        const environment = installChartEnvironment()

        environment.create()
        detachAndAttach(environment)
        rendererCalls.length = 0
        environment.observer().callback([])

        expect(rendererCalls)
            .toEqual(['resume'])
    })

    it('Should start suspended when the canvas is not attached', () => {
        const { host, create } = installChartEnvironment()

        Object.assign(host, { appendChild: () => {} })
        create(chartSettings())

        expect(rendererCalls)
            .toContain('suspend')
    })

    it('Should apply settings again when the system theme changes', () => {
        const { changeTheme, create } = installChartEnvironment()

        create()
        rendererCalls.length = 0
        changeTheme(true)

        expect(rendererCalls)
            .toContain('apply')
    })
})
