import TreeMapDefinition from '@/charts/TreeMapDefinition'
import Value from '@/types/base/Value'
import TreeData from '@/types/data/TreeData'

describe('Tree map chart definition', () => {
    it('Should require more than one value for the legend', () => {
        const value = new Value({ label: 'a' })

        expect(TreeMapDefinition.hasLegend({ values: [value] } as TreeData))
            .toBe(false)
        expect(TreeMapDefinition.hasLegend({ values: [value, value] } as TreeData))
            .toBe(true)
        expect(TreeMapDefinition.hasLegend({} as TreeData))
            .toBe(false)
    })

    it('Should take palette values from the tree data', () => {
        const values = [new Value({ label: 'a' })]

        expect(TreeMapDefinition.getPaletteValues({ values } as TreeData))
            .toBe(values)
    })
})
