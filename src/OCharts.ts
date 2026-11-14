import Chart from '@/Chart'
import ChartSettings from '@/types/ChartSettings'

function OCharts() {
}

OCharts.chart = function(context: HTMLElement, settings: ChartSettings) {
    return new Chart(context, settings)
}

// @ts-ignore
window.OCharts = OCharts

export default OCharts
export type { default as ChartSettings } from '@/types/ChartSettings'
export { ChartType, LegendPlace } from '@/static/Enums'