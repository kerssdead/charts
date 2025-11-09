import PlotSeries from 'types/PlotSeries'

class HoverItem {
    x: number

    y: number

    index: number

    data: any

    series?: PlotSeries | undefined
}

export default HoverItem