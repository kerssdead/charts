import TreeMapDefinition from '@/charts/TreeMapDefinition'
import Value from '@/types/base/Value'

describe('Tree map chart definition', () => {
    it('Should require more than one value for the legend', () => {
        const value = new Value({ label: 'a' })

        expect(TreeMapDefinition.hasLegend({ values: [value] }))
            .toBe(false)
        expect(TreeMapDefinition.hasLegend({ values: [value, value] }))
            .toBe(true)
        expect(TreeMapDefinition.hasLegend({}))
            .toBe(false)
    })

    it('Should take palette values from the tree data', () => {
        const values = [new Value({ label: 'a' })]

        expect(TreeMapDefinition.getPaletteValues({ values }))
            .toBe(values)
    })
})
