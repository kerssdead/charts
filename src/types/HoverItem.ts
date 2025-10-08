import { PlotSeries } from './PlotSeries'

export class HoverItem {
    x: number

    y: number

    index: number

    data: any

    series?: PlotSeries | undefined
}