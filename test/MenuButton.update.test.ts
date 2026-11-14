import MenuButton from '@/renderer/MenuButton'
import Queue from '@/render/Queue'
import Frame from '@/renderer/Frame'
import HoverProgress from '@/types/HoverProgress'

jest.mock('@/Theme', () => ({
    hoverBackground: (hover: number) => `#0000${ Math.round(hover * 255).toString(16) }00`,
    text: '#000000'
}))

globalThis.DOMRect = class {
    constructor(public x = 0, public y = 0, public width = 0, public height = 0) {
    }
} as unknown as typeof DOMRect

const context = () => ({}) as CanvasRenderingContext2D

const create = (width: number, height: number, top: number) => {
    const button = new MenuButton()
    const queue = new Queue(context())

    button.onClick = jest.fn()
    button.resize(width, height, top)

    return { button, queue }
}

const update = (button: MenuButton, queue: Queue, mouse: { x: number, y: number } | null) => {
    return button.update({ queue, mouse, now: 0 } as unknown as Frame)
}

describe('Updating menu button', () => {
    it('Should not show anything before resizing', () => {
        const button = new MenuButton()
        const queue = new Queue(context())

        expect(update(button, queue, null))
            .toBe(false)
        expect(queue.items)
            .toEqual([])
    })

    it('Should build the button items after resizing', () => {
        const { button, queue } = create(200, 100, 10)

        update(button, queue, { x: 200, y: 10 })

        expect(queue.items.length)
            .toBe(2)
    })

    it('Should keep the button items when nothing changes', () => {
        const { button, queue } = create(200, 100, 10)

        update(button, queue, { x: 200, y: 10 })
        update(button, queue, { x: 200, y: 10 })

        expect(queue.items.length)
            .toBe(2)
    })

    it('Should trigger the click handler', () => {
        const { button, queue } = create(200, 100, 10)

        update(button, queue, { x: 200, y: 10 })

        const rect = queue.items[0]

        rect.onClick?.()

        expect(button.onClick)
            .toHaveBeenCalledTimes(1)
    })

    it('Should clear the button when it has no size', () => {
        const { button, queue } = create(200, 100, 10)

        update(button, queue, { x: 200, y: 10 })

        button.resize(0, 0, 10)
        update(button, queue, null)

        expect(queue.items)
            .toEqual([])
    })
})
