import Panel from '@/types/Panel'

describe('Building panels grid', () => {
    it('Should fill whole area for single chart without title', () => {
        const panels = Panel.grid([0], 1000, 500)

        expect(panels.map(panel => panel.rect))
            .toEqual([{ x: 0, y: 0, width: 1, height: 1 }])
    })

    it('Should pick columns closest to square cells', () => {
        const panels = Panel.grid([0, 0, 0, 0], 1000, 1000)

        expect(panels[3].rect)
            .toEqual({ x: .508, y: .508, width: .492, height: .492 })
    })

    it('Should place all charts in one row when wide', () => {
        const panels = Panel.grid([0, 0, 0], 3000, 100)

        expect(panels.map(panel => panel.rect.y))
            .toEqual([0, 0, 0])
    })

    it('Should clamp requested columns to charts count', () => {
        const panels = Panel.grid([0, 0, 0], 1000, 1000, 10)

        expect(panels.map(panel => panel.rect.y))
            .toEqual([0, 0, 0])
    })

    it('Should center incomplete last row', () => {
        const panels = Panel.grid([0, 0, 0], 1000, 1000, 2)

        expect(panels[2].rect.x)
            .toBeCloseTo(.254)
    })

    it('Should reserve space for panel title', () => {
        const [first, second] = Panel.grid([20, 0], 1000, 500, 2)

        expect(first.rect.y)
            .toBeCloseTo(.04)
        expect(first.rect.height)
            .toBeCloseTo(.96)
        expect(second.rect.height)
            .toBe(1)
    })
})