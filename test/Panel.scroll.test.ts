import Panel from '@/types/Panel'
import CanvasWindow from '@/types/CanvasWindow'

function create(height: number) {
    const panel = new Panel(0, { x: 0, y: 0, width: 1, height: 1 })

    panel.scroll = { top: 20, height }
    panel.update(new CanvasWindow(200, 100))

    return panel
}

describe('Scrolling panel', () => {
    it('Should not scroll when content fits', () => {
        const panel = create(80)

        expect([panel.canScroll, panel.scrollTo(10), panel.thumb])
            .toEqual([false, false, null])
    })

    it('Should clamp offset to content', () => {
        const panel = create(300)

        panel.scrollTo(500)

        expect(panel.offset)
            .toBe(200)

        panel.scrollTo(-10)

        expect(panel.offset)
            .toBe(0)
    })

    it('Should shift body window and keep header out of clip', () => {
        const panel = create(300)
        const window = new CanvasWindow(200, 100)

        panel.scrollTo(50)
        panel.update(window)

        expect([panel.body.y, panel.clip])
            .toEqual([-50, { x: 0, y: 20, width: 200, height: 80 }])
    })

    it('Should place thumb by offset', () => {
        const panel = create(200)
        const window = new CanvasWindow(200, 100)

        panel.update(window)

        const top = panel.thumb!

        panel.scrollTo(panel.maxOffset)
        panel.update(window)

        const bottom = panel.thumb!

        expect([top.y, bottom.y + bottom.height, top.height])
            .toEqual([20, 100, 80 * 80 / 180])
    })

    it('Should detect scrollbar area', () => {
        const panel = create(300)

        expect([panel.isOnScrollbar({ x: 195, y: 50 }), panel.isOnScrollbar({ x: 150, y: 50 }), panel.isOnScrollbar({ x: 195, y: 10 })])
            .toEqual([true, false, false])
    })
})

describe('Gliding panel scroll', () => {
    it('Should move offset towards target over frames', () => {
        const panel = create(300)

        expect(panel.glideTo(100))
            .toBe(true)

        panel.animateScroll(0)

        const first = panel.offset

        panel.animateScroll(1000)

        expect([first > 0 && first < 100, panel.offset, panel.animateScroll(1016)])
            .toEqual([true, 100, false])
    })

    it('Should clamp target and report no change at edge', () => {
        const panel = create(300)

        panel.glideTo(1000)

        expect([panel.target, panel.glideTo(2000)])
            .toEqual([200, false])
    })

    it('Should stop gliding when scrolled directly', () => {
        const panel = create(300)

        panel.glideTo(150)
        panel.scrollTo(20)

        expect([panel.offset, panel.target, panel.animateScroll(0)])
            .toEqual([20, 20, false])
    })
})
