import { LIGHT_THEME } from '@/Theme'

import TreeMapProcess from '@/render/tree/TreeMapProcess'
import TreeData, { TreeValue } from '@/types/data/TreeData'
import Value from '@/types/base/Value'
import { createState } from './ViewStateTestData'

const create = (values: TreeValue[]) => {
    return new TreeMapProcess(
        { values } as TreeData,
        { x: 5, y: 5 },
        { valuePostfix: undefined, theme: LIGHT_THEME },
        { state: createState({ values }) }
    )
}

describe('Checking tree emptiness', () => {
    it('Should be empty without enabled positive values', () => {
        expect(create([]).isEmpty())
            .toBe(true)
        expect(create([new Value({ value: 1, disabled: true })]).isEmpty())
            .toBe(true)
        expect(create([new Value({ value: 0 }), new Value({ value: -1 })]).isEmpty())
            .toBe(true)
    })

    it('Should be empty when group has no positive sectors', () => {
        expect(create([new Value({ sectors: [new Value({ value: 0 }), new Value({ value: -2 })] })]).isEmpty())
            .toBe(true)
    })

    it('Should not be empty with enabled positive value', () => {
        expect(create([new Value({ value: 1 })]).isEmpty())
            .toBe(false)
        expect(create([new Value({ sectors: [new Value({ value: 2 })] })]).isEmpty())
            .toBe(false)
    })
})