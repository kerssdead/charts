import ChartMenu from '@/renderer/ChartMenu'
import Queue from '@/render/Queue'
import ChartSettings from '@/types/ChartSettings'
import { ChartType } from '@/static/Enums'
import { DARK_THEME } from './TestTheme'

const settings = {
    title: 'Chart',
    charts: [{ type: ChartType.Plot, data: { values: [] } }]
} as unknown as ChartSettings

const create = (overrides: Partial<ChartSettings> = {}) => {
    const onOpen = jest.fn()
    const menu = new ChartMenu(
        {} as HTMLCanvasElement,
        new Queue({} as CanvasRenderingContext2D),
        onOpen,
        jest.fn()
    )

    menu.apply({ ...settings, ...overrides }, () => false, DARK_THEME)

    return { menu, onOpen }
}

describe('Opening chart menu', () => {
    it('Should open the menu below the button', () => {
        const { menu, onOpen } = create()

        menu.button!.bounds = { right: 20, bottom: 30 } as DOMRect

        expect([menu.open(), onOpen.mock.calls])
            .toEqual([true, [[{ x: 20, y: 30 }]]])
    })

    it('Should report that there is no menu when it is disabled', () => {
        const { menu, onOpen } = create({ disableMenu: true })

        expect([menu.open(), onOpen.mock.calls.length])
            .toEqual([false, 0])
    })
})