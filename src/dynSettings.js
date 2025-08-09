class ODynSettings {
    /**
     * @type {ORenderer}
     */
    renderer

    /**
     * @param {OChart} chart
     * @param {OChartSettings} settings
     */
    constructor(chart, settings) {
        switch (settings.type) {
            case OChartTypes.plot:
                this.renderer = new OPlotRenderer(chart, settings, this)
                break

            case OChartTypes.circular:
                this.renderer = new OCircularRenderer(chart, settings, this)

                if (settings.enableOther && chart.data.values.length > 20) {
                    const sum = chart.data.values.splice(20).reduce((acc, v) => acc + v.current, 0)

                    chart.data.values = chart.data.values.slice(0, 20)

                    chart.data.values.push({
                        value: sum,
                        current: sum,
                        label: 'Other',
                        id: OHelper.guid(),
                        color: '#a3a3a3'
                    })
                }

                break
        }
    }
}