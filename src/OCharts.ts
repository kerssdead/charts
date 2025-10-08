import { Chart } from './Chart'
import { ChartSettings } from './types/ChartSettings'

function OCharts() {
}

OCharts.chart = function(context: HTMLElement, settings: ChartSettings) {
    return new Chart(context, settings)
}

// @ts-ignore
window.OCharts = OCharts