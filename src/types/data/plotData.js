import { OData } from '/src/types/base/data.js'

export class OPlotData extends OData {
    /**
     * @type {OPlotSeries[]}
     */
    values

    /**
     * @type {string}
     */
    xTitle

    /**
     * @type {string}
     */
    yTitle

    /**
     * @type {number}
     */
    yMax

    /**
     * @type {number}
     */
    xType
}