import { fieldItem, WINDOW } from './RenderItemFieldTestData'

describe('Getting field tooltip', () => {
    it('Should ask the lookup for the position inside the box', () => {
        const item = fieldItem()
        const lookup = jest.fn(() => 'text')

        item.lookup = lookup
        item.adjust(WINDOW)

        expect(item.tooltipAt({ x: 250, y: 425 }))
            .toBe('text')
        expect(lookup)
            .toHaveBeenCalledWith(.5, .5)
    })

    it('Should give the corners of the box as 0 and 1', () => {
        const item = fieldItem()
        const lookup = jest.fn(() => null)

        item.lookup = lookup
        item.adjust(WINDOW)
        item.tooltipAt({ x: 200, y: 400 })
        item.tooltipAt({ x: 300, y: 450 })

        expect(lookup.mock.calls)
            .toEqual([[0, 0], [1, 1]])
    })

    it('Should give nothing by default', () => {
        const item = fieldItem()

        item.adjust(WINDOW)

        expect(item.tooltipAt({ x: 250, y: 425 }))
            .toBeNull()
    })
})