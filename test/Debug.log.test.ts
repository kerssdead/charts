import Debug from '@/helpers/Debug'
import { ColorTheme } from '@/Theme'

describe('Debug logging', () => {
    it('Should not log when debug mode is disabled', () => {
        const log = jest.spyOn(console, 'log').mockImplementation()

        Debug.log({} as never, { enableDebugMode: false } as never, {} as HTMLCanvasElement, ColorTheme.light)

        expect(log)
            .not.toHaveBeenCalled()
    })

    it('Should log the chart state in debug mode', () => {
        const log = jest.spyOn(console, 'log').mockImplementation()

        Debug.log(
            { title: 'Input' } as never,
            { enableDebugMode: true } as never,
            {} as HTMLCanvasElement,
            ColorTheme.dark
        )

        expect(log)
            .toHaveBeenCalledWith('OCharts:', expect.objectContaining({ theme: ColorTheme[ColorTheme.dark] }))
    })
})
