import Debug from '@/helpers/Debug'

jest.mock('@/Theme', () => ({ currentTheme: 0, ColorTheme: { 0: 'light', 1: 'dark' } }))

describe('Debug logging', () => {
    it('Should not log when debug mode is disabled', () => {
        const log = jest.spyOn(console, 'log').mockImplementation()

        Debug.log({} as never, { enableDebugMode: false } as never, {} as HTMLCanvasElement)

        expect(log)
            .not.toHaveBeenCalled()
    })

    it('Should log the chart state in debug mode', () => {
        const log = jest.spyOn(console, 'log').mockImplementation()

        Debug.log({ title: 'Input' } as never, { enableDebugMode: true } as never, {} as HTMLCanvasElement)

        expect(log)
            .toHaveBeenCalledWith('OCharts:', expect.objectContaining({ theme: 'light' }))
    })
})
