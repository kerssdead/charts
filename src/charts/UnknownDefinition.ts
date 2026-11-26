import ChartDefinition from '@/charts/ChartDefinition'
import ChartProcess from '@/render/ChartProcess'
import Data from '@/types/interfaces/Data'

class UnknownProcess extends ChartProcess<Data> {
    getData() {
        return []
    }

    isEmpty() {
        return false
    }
}

const UnknownDefinition: ChartDefinition<Data> = {
    createProcess: (data, pixel, settings, context) => new UnknownProcess(data, pixel, settings, context),
    prepareData: () => {},
    normalizeData: () => {},
    getPaletteValues: () => [],
    getTableRows: () => ({ headers: [], values: [] }),
    hasLegend: () => false,
    hasMenu: false,
    hasFixedHeader: false
}

export default UnknownDefinition