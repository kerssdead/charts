import TooltipOverlay from '@/renderer/TooltipOverlay'
import CustomTooltip from '@/renderer/CustomTooltip'
import ChartSettings from '@/types/ChartSettings'

const settings = (overrides: Partial<ChartSettings>) => overrides as ChartSettings

afterEach(() => {
    jest.restoreAllMocks()
})

describe('Applying tooltip overlay settings', () => {
    it('Should hide the current tooltip', () => {
        const overlay = new TooltipOverlay({} as HTMLCanvasElement)
        const hide = jest.spyOn(overlay.custom, 'hide').mockImplementation()

        overlay.apply(settings({ enableTooltip: true }))

        expect(hide)
            .toHaveBeenCalled()
    })

    it('Should build the template when tooltips are enabled and a template id is set', () => {
        const fromTemplate = jest.spyOn(CustomTooltip, 'fromTemplate').mockReturnValue(null)

        new TooltipOverlay({} as HTMLCanvasElement).apply(settings({ enableTooltip: true, templateId: 'tip' }))

        expect(fromTemplate)
            .toHaveBeenCalledWith('tip')
    })

    it('Should not build the template without a template id', () => {
        const fromTemplate = jest.spyOn(CustomTooltip, 'fromTemplate').mockReturnValue(null)

        new TooltipOverlay({} as HTMLCanvasElement).apply(settings({ enableTooltip: true }))

        expect(fromTemplate)
            .not.toHaveBeenCalled()
    })

    it('Should not build the template when tooltips are disabled', () => {
        const fromTemplate = jest.spyOn(CustomTooltip, 'fromTemplate').mockReturnValue(null)

        new TooltipOverlay({} as HTMLCanvasElement).apply(settings({ enableTooltip: false, templateId: 'tip' }))

        expect(fromTemplate)
            .not.toHaveBeenCalled()
    })
})
