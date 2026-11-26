import Scene from '@/renderer/Scene'
import ChartPanels from '@/renderer/ChartPanels'
import Queue from '@/render/Queue'
import { LIGHT_THEME } from '@/Theme'

jest.mock('@/renderer/ChartPanels')

describe('Creating scene', () => {
    it('Should keep the given queue and theme', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)
        const theme = { getPalette: () => LIGHT_THEME, sync: () => false }
        const scene = new Scene(queue, theme)

        expect([scene.queue, scene.theme])
            .toEqual([queue, theme])
    })

    it('Should build panels on the scene queue and layout', () => {
        const queue = new Queue({} as CanvasRenderingContext2D)
        const scene = new Scene(queue, { getPalette: () => LIGHT_THEME, sync: () => false })

        expect(ChartPanels)
            .toHaveBeenLastCalledWith(queue, scene.layout)
    })

    it('Should start without legend', () => {
        const scene = new Scene(new Queue({} as CanvasRenderingContext2D), {
            getPalette: () => LIGHT_THEME,
            sync: () => false
        })

        expect(scene.legend)
            .toBeUndefined()
    })
})