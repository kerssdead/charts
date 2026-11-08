import ChartSettings from '@/types/ChartSettings'
import Theme, { ColorTheme } from '@/Theme'

export default class Debug {
    static log(input: ChartSettings, settings: ChartSettings, canvas: HTMLCanvasElement) {
        if (!settings.enableDebugMode)
            return

        console.log('OCharts:', {
            input,
            settings,
            size: {
                width: canvas.parentElement?.clientWidth,
                height: canvas.parentElement?.clientHeight
            },
            theme: ColorTheme[Theme.currentTheme]
        })
    }
}