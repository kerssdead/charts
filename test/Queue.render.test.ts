import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import CanvasWindow from '@/types/CanvasWindow'
import { LIGHT_THEME } from '@/Theme'
import { DARK_THEME } from './TestTheme'

const WINDOW = new CanvasWindow(100, 100)

const context = () => ({ setTransform: jest.fn(), fillRect: jest.fn() }) as unknown as CanvasRenderingContext2D

function item(key: string, layer: number, rendered: string[]) {
    const result = new RenderItem(new RenderItemRectangle())

    result.key = key
    result.layer = layer
    result.render = () => {
        rendered.push(key)
    }

    return result
}

describe('Rendering queue', () => {
    it('Should render items in layer order', () => {
        const rendered: string[] = []
        const queue = new Queue(context())

        queue.add([item('top', 2, rendered), item('bottom', 0, rendered), item('middle', 1, rendered)])

        queue.render(0, WINDOW, WINDOW, LIGHT_THEME)

        expect(rendered)
            .toEqual(['bottom', 'middle', 'top'])
    })

    it('Should remove temp items after render', () => {
        const rendered: string[] = []
        const queue = new Queue(context())
        const temp = item('temp', 0, rendered)

        temp.isTemp = true

        queue.add([temp, item('kept', 0, rendered)])
        queue.render(0, WINDOW, WINDOW, LIGHT_THEME)

        expect(queue.items.map(i => i.key))
            .toEqual(['kept'])
    })

    it('Should clear the canvas with the theme background', () => {
        const ctx = {
            setTransform: jest.fn(),
            fillRect: jest.fn(),
            fillStyle: ''
        } as unknown as CanvasRenderingContext2D
        const queue = new Queue(ctx)

        queue.render(0, WINDOW, WINDOW, DARK_THEME)

        expect(ctx.fillStyle)
            .toBe(DARK_THEME.canvasBackground)
    })

    it('Should report animation of initializing items', () => {
        const queue = new Queue(context())
        const animated = item('animated', 0, [])

        animated.animation.initDuration = 100

        queue.add([animated])

        expect(queue.render(0, WINDOW, WINDOW, LIGHT_THEME))
            .toBe(true)
    })
})