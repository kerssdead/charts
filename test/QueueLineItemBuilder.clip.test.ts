import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemLine from '@/types/RenderItemLine'

const BOX = { x: 1, y: 2, width: 3, height: 4 }

const buildLine = (action: (items: QueueItemsBuilder) => void) => {
    return QueueItemsBuilder.build(action)[0].shape as RenderItemLine
}

describe('Building line clip', () => {
    it('Should set clip box', () => {
        expect(buildLine(items => items.line().clip(BOX)).clip)
            .toEqual(BOX)
    })

    it('Should keep line without clip by default', () => {
        expect(buildLine(items => items.line()).clip)
            .toBeNull()
    })
})