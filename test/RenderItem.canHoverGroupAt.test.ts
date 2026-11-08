import RenderItem from '@/types/RenderItem'
import RenderItemRectangle from '@/types/RenderItemRectangle'
import CanvasWindow from '@/types/CanvasWindow'
import { HorizontalAlignment, VerticalAlignment } from '@/static/Enums'

const INSIDE = { x: 50, y: 50 }

const OUTSIDE = { x: 500, y: 50 }

const hoverable = () => {
    const shape = new RenderItemRectangle()
    const item = new RenderItem(shape)

    shape.absolute = { x: 0, y: 0, width: 1000, height: 1000 }
    shape.align = { x: HorizontalAlignment.Left, y: VerticalAlignment.Top }
    shape.adjust(new CanvasWindow(500, 500))

    item.hoverGroup = 'group'
    item.isInteractive = true

    return item
}

describe('Checking hover group at point', () => {
    it('Should hover interactive item with group under point', () => {
        expect(hoverable().canHoverGroupAt(INSIDE))
            .toBe(true)
    })

    it('Should not hover item without group', () => {
        const item = hoverable()

        item.hoverGroup = null

        expect(item.canHoverGroupAt(INSIDE))
            .toBe(false)
    })

    it('Should not hover non-interactive item', () => {
        const item = hoverable()

        item.isInteractive = false

        expect(item.canHoverGroupAt(INSIDE))
            .toBe(false)
    })

    it('Should not hover item while it is initializing', () => {
        const item = hoverable()

        item.animation.initDuration = 300

        expect(item.canHoverGroupAt(INSIDE))
            .toBe(false)
    })

    it('Should not hover item outside of point', () => {
        expect(hoverable().canHoverGroupAt(OUTSIDE))
            .toBe(false)
    })
})