import ChartMenu from '@/renderer/ChartMenu'
import Queue from '@/render/Queue'
import ChartSettings from '@/types/ChartSettings'
import { ChartType } from '@/static/Enums'
import { DARK_THEME } from './TestTheme'

const settings = {
    title: 'Chart',
    charts: [{ type: ChartType.Plot, data: { values: [] } }]
} as unknown as ChartSettings

describe('Applying chart menu settings', () => {
    it('Should create and remove the menu button', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)
        const menu = new ChartMenu({} as HTMLCanvasElement, queue, jest.fn(), jest.fn())

        menu.apply(settings, () => false, DARK_THEME)

        const button = menu.button

        expect(button)
            .toBeDefined()

        menu.apply({ ...settings, disableMenu: true }, () => false, DARK_THEME)

        expect(menu.button)
            .toBeUndefined()
    })
})