import Layout from '@/renderer/Layout'
import MenuButton from '@/renderer/MenuButton'

const menu = { resize: () => {}, bounds: { left: 760 } } as unknown as MenuButton

function getTop(title: string | undefined, hasMenu: boolean, reserveMenuRow: boolean) {
    const layout = new Layout()

    layout.width = 800
    layout.height = 300

    layout.update(title, undefined, hasMenu ? menu : undefined, reserveMenuRow)

    return layout.window.y
}

describe('Reserving menu row', () => {
    it('Should reserve menu row when requested and there is no title', () => {
        expect(getTop(undefined, true, true))
            .toBe(MenuButton.rowHeight)
    })

    it('Should not reserve menu row without menu or request', () => {
        expect([getTop(undefined, false, true), getTop(undefined, true, false)])
            .toEqual([0, 0])
    })

    it('Should use title row when there is a title', () => {
        expect(getTop('Lorem', true, true))
            .toBe(getTop('Lorem', true, false))
    })
})
