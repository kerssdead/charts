import ChartMenu from '@/renderer/ChartMenu'
import Queue from '@/render/Queue'
import ChartSettings from '@/types/ChartSettings'
import { ChartType } from '@/static/Enums'
import { DARK_THEME } from './TestTheme'

const settings = {
    title: 'Chart',
    charts: [{ type: ChartType.Plot, data: { values: [] } }]
} as unknown as ChartSettings

describe('Removing chart menu', () => {
    it('Should clear the menu button and its queue items', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)
        const remove = jest.spyOn(queue, 'remove')
        const menu = new ChartMenu({} as HTMLCanvasElement, queue, jest.fn(), jest.fn())

        menu.apply(settings, () => false, DARK_THEME)
        menu.remove()

        expect(menu.button)
            .toBeUndefined()
        expect(remove)
            .toHaveBeenCalled()
    })
})