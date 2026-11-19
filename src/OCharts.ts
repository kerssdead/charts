import Chart from '@/Chart'
import ChartSettings from '@/types/ChartSettings'

const OCharts = {
    chart(context: HTMLElement, settings: ChartSettings) {
        return new Chart(context, settings)
    }
}

Object.assign(window, { OCharts })

export default OCharts
export type { default as ChartSettings } from '@/types/ChartSettings'
export {
    ChartType,
    LegendPlace,
    LineDrawMode,
    PlotAxisType,
    PlotScaleType,
    PlotType
} from '@/static/Enums'