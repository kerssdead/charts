import { OData } from '/src/types/base/data.js'

export class OCircularData extends OData {
    /**
     * @type {int}
     */
    type

    /**
     * @type {number}
     */
    innerRadius

    /**
     * @type {string}
     */
    innerTitle

    /**
     * @type {OSector[]}
     */
    values
}