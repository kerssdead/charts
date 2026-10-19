import { fromDropdownItems } from '@/types/ButtonOptions'

describe('Building buttons from dropdown items', () => {
    const divider = { text: '', action: () => { }, isDivider: true }

    it('Should return empty array for undefined items', () => {
        expect(fromDropdownItems(undefined))
            .toEqual([])
    })

    it('Should collapse dividers and trim them at edges', () => {
        const buttons = fromDropdownItems([
            divider,
            { text: 'A', action: () => { } },
            divider,
            divider,
            { text: 'B', action: () => { } },
            divider
        ])

        expect(buttons.map(button => button.isDivider ? '-' : button.text))
            .toEqual(['A', '-', 'B'])
    })

    it('Should skip items by condition', () => {
        const buttons = fromDropdownItems([
            { text: 'A', action: () => { }, condition: data => data?.type == 'visible' },
            divider,
            { text: 'B', action: () => { }, condition: data => data?.type != 'visible' }
        ], { type: 'visible' })

        expect(buttons.map(button => button.text))
            .toEqual(['A'])
    })

    it('Should pass data to action', () => {
        const action = jest.fn()
        const data = { id: '1' }

        fromDropdownItems([{ text: 'A', action }], data)[0].action()

        expect(action)
            .toHaveBeenCalledWith(data)
    })
})