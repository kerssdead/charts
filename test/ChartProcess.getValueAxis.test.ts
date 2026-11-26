import { LIGHT_THEME } from '@/Theme'

import ChartProcess from '@/render/ChartProcess'
import Data from '@/types/interfaces/Data'
import { createState } from './ViewStateTestData'

class TestProcess extends ChartProcess<Data> {
    getData() {
        return []
    }
}

describe('Getting chart value axis', () => {
    it('Should have no value axis by default', () => {
        const process = new TestProcess(
            { values: [] } as unknown as Data,
            { x: 1, y: 1 },
            { valuePostfix: undefined, theme: LIGHT_THEME },
            { state: createState() }
        )

        expect(process.getValueAxis())
            .toBeNull()
    })
})