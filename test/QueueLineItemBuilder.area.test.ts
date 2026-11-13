import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemLine from '@/types/RenderItemLine'

const buildLine = (action: (items: QueueItemsBuilder) => void) => {
    return QueueItemsBuilder.build(action)[0].shape as RenderItemLine
}

describe('Building line area', () => {
    it('Should set area baseline', () => {
        expect(buildLine(items => items.line().area(400)).area.baseline)
            .toBe(400)
    })

    it('Should keep line without area by default', () => {
        expect(buildLine(items => items.line()).area.baseline)
            .toBeNull()
    })
})