import ChartSettings from '@/types/ChartSettings'
import ChartOptions from '@/types/ChartOptions'
import { ColorTheme } from '@/Theme'

export default class Debug {
    static log(input: ChartOptions, settings: ChartSettings, canvas: HTMLCanvasElement, theme: ColorTheme) {
        if (!settings.enableDebugMode)
            return

        console.log('OCharts:', {
            input,
            settings,
            size: {
                width: canvas.parentElement?.clientWidth,
                height: canvas.parentElement?.clientHeight
            },
            theme: ColorTheme[theme]
        })
    }
}