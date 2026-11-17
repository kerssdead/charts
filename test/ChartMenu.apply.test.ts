import ChartMenu from '@/renderer/ChartMenu'
import MenuButton from '@/renderer/MenuButton'
import Queue from '@/render/Queue'
import ChartSettings from '@/types/ChartSettings'
import { ChartType } from '@/static/Enums'
import { DARK_THEME } from './TestTheme'

const settings = {
    title: 'Chart',
    charts: [{ type: ChartType.Plot, data: { values: [] } }]
} as unknown as ChartSettings

const createMenu = (onOpen: () => void = jest.fn()) => {
    const queue = new Queue({} as CanvasRenderingContext2D)

    return new ChartMenu({} as HTMLCanvasElement, queue, onOpen, jest.fn())
}

const applied = (menu: ChartMenu, overrides: Partial<ChartSettings> = {}) => {
    menu.apply({ ...settings, ...overrides }, () => false, DARK_THEME)

    return menu.button as MenuButton
}

describe('Applying chart menu settings', () => {
    it('Should create and remove the menu button', () => {
        const menu = createMenu()

        expect(applied(menu))
            .toBeDefined()

        applied(menu, { disableMenu: true })

        expect(menu.button)
            .toBeUndefined()
    })

    it('Should open the menu below the button when it is clicked', () => {
        const onOpen = jest.fn()
        const button = applied(createMenu(onOpen))

        button.bounds = { right: 20, bottom: 30 } as DOMRect
        button.onClick?.()

        expect(onOpen)
            .toHaveBeenCalledWith({ x: 20, y: 30 })
    })

    it('Should not open the menu before the button has bounds', () => {
        const onOpen = jest.fn()

        applied(createMenu(onOpen)).onClick?.()

        expect(onOpen)
            .not.toHaveBeenCalled()
    })

    it('Should keep the same button when settings are applied again', () => {
        const menu = createMenu()
        const button = applied(menu)

        expect(applied(menu))
            .toBe(button)
    })

    it('Should not create the button when interactions are disabled', () => {
        const menu = createMenu()

        applied(menu, { disableInteractions: true })

        expect(menu.button)
            .toBeUndefined()
    })

    it('Should not create the button when no chart has a menu', () => {
        const menu = createMenu()

        applied(menu, { charts: [] })

        expect(menu.button)
            .toBeUndefined()
    })
})
