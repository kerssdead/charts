function OCharts() {}

OCharts.chart = function (context: HTMLChartElement, settings: ChartSettings) {
    return new Chart(context, settings)
}

window.OCharts = OCharts