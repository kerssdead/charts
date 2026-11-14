import Panel from '@/types/Panel'
import CanvasWindow from '@/types/CanvasWindow'

const panel = () => {
    const result = new Panel(0, { x: 0, y: 0, width: 1, height: 1 })

    result.clip = { x: 0, y: 0, width: 200, height: 100 }
    result.baseHeight = 50
    result.scroll = { top: 20, height: 300 }
    result.update(new CanvasWindow(200, 100))

    return result
}

describe('Getting panel drag', () => {
    it('Should drag by the scrollbar thumb ratio', () => {
        const target = panel()

        const drag = target.getDrag({ x: 195, y: 50 })

        expect(typeof drag)
            .toBe('function')

        const ratio = target.maxOffset / Math.max(target.clip.height - (target.thumb?.height ?? 0), 1)

        drag?.(10)

        expect(target.offset)
            .toBe(10 * ratio)
    })

    it('Should drag by inverse zoom on the clip content', () => {
        const target = panel()

        target.scrollTo(50)

        const drag = target.getDrag({ x: 100, y: 50 })

        drag?.(20)

        expect(target.offset)
            .toBe(30)
    })

    it('Should return nothing outside the panel', () => {
        expect(panel().getDrag({ x: 500, y: 500 }))
            .toBeNull()
    })
})
