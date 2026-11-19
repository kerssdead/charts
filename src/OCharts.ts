import Chart from '@/Chart'
import ChartOptions from '@/types/ChartOptions'

const OCharts = {
    chart(context: HTMLElement, options: ChartOptions) {
        return new Chart(context, options)
    }
}

Object.assign(window, { OCharts })

export default OCharts
export type { default as ChartOptions } from '@/types/ChartOptions'
export type { default as ChartSettings } from '@/types/ChartOptions'
export {
    ChartType,
    LegendPlace,
    LineDrawMode,
    PlotAxisType,
    PlotScaleType,
    PlotType
} from '@/static/Enums'