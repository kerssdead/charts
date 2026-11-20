import { installChartEnvironment, removeChartEnvironment, chartSettings } from './ChartTestData'
import { Attribute, Tag } from '@/static/Enums'

jest.mock('@/renderer/Renderer', () => jest.requireActual('./ChartRendererMock').mockRendererModule)

afterEach(() => {
    jest.restoreAllMocks()
    removeChartEnvironment()
})

describe('Naming chart canvas', () => {
    it('Should name the canvas from the settings', () => {
        const { canvas, create } = installChartEnvironment()

        create(chartSettings({ title: 'Revenue' }))

        expect(canvas().getAttribute(Attribute.AriaLabel))
            .toBe('Revenue')
    })

    it('Should rename the canvas when settings change', () => {
        const { canvas, create } = installChartEnvironment()
        const chart = create(chartSettings({ title: 'Revenue' }))

        chart.applySettings(chartSettings({ title: 'Costs', ariaLabel: 'Custom' }))

        expect(canvas().getAttribute(Attribute.AriaLabel))
            .toBe('Custom')
    })

    it('Should link the canvas to the table hint when the menu is available', () => {
        const { canvas, create } = installChartEnvironment()

        create()

        expect(canvas().getAttribute(Attribute.AriaDescribedBy))
            .not.toBeNull()
    })

    it('Should not link the canvas to the table hint when the menu is disabled', () => {
        const { canvas, create } = installChartEnvironment()

        create(chartSettings({ disableMenu: true }))

        expect(canvas().getAttribute(Attribute.AriaDescribedBy))
            .toBeNull()
    })

    it('Should remove the table hint on destroy', () => {
        const { host, create } = installChartEnvironment()

        create().destroy()

        expect(host.elements.map(element => element.tagName))
            .not.toContain(Tag.Span)
    })

    it('Should make the canvas focusable', () => {
        const { canvas, create } = installChartEnvironment()

        create()

        expect(canvas().getAttribute(Attribute.TabIndex))
            .toBe('0')
    })

    it('Should not make the canvas focusable without interactions', () => {
        const { canvas, create } = installChartEnvironment()
        const chart = create()

        chart.applySettings(chartSettings({ disableInteractions: true }))

        expect(canvas().getAttribute(Attribute.TabIndex))
            .toBeNull()
    })
})