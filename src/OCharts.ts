function OCharts() {
}

OCharts.chart = function(context: HTMLElement, settings: ChartSettings) {
    return new Chart(context, settings)
}

window.OCharts = OCharts