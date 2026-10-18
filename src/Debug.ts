import ChartSettings from '@/types/ChartSettings'
import Theme, { ColorTheme } from '@/Theme'

export default class Debug {
    static log(input: ChartSettings, settings: ChartSettings, canvas: HTMLCanvasElement) {
        if (!settings.enableDebugMode)
            return

        console.log('OCharts:', {
            input: Debug.copy(input),
            settings: Debug.copy(settings),
            size: {
                width: canvas.parentElement?.clientWidth,
                height: canvas.parentElement?.clientHeight
            },
            theme: ColorTheme[Theme.currentTheme]
        })
    }

    private static copy(value: ChartSettings) {
        try {
            return JSON.parse(JSON.stringify(value))
        } catch {
            return value
        }
    }
}