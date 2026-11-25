import { getEdges } from '@/render/heatMap/HeatMapLayout'

describe('Getting cell edges', () => {
    it('Should give one more edge than cells', () => {
        expect(getEdges(4, 0, 100))
            .toHaveLength(5)
    })

    it('Should split the size evenly from the start', () => {
        expect(getEdges(4, 10, 100))
            .toEqual([10, 35, 60, 85, 110])
    })

    it('Should round edges to whole pixels so neighbours share them', () => {
        expect(getEdges(3, 0, 100))
            .toEqual([0, 33, 67, 100])
    })

    it('Should end exactly at the end of the size', () => {
        const edges = getEdges(7, 5, 101)

        expect(edges[edges.length - 1])
            .toBe(106)
    })
})