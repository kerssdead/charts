import QueueItemsBuilder from '@/builders/QueueItemsBuilder'
import RenderItemLine from '@/types/RenderItemLine'

const buildLine = (action: (items: QueueItemsBuilder) => void) =>
    QueueItemsBuilder.build(action)[0].shape as RenderItemLine

describe('Building line area', () => {
    it('Should set area baseline', () => {
        expect(buildLine(items => items.line().area(400)).areaBaseline)
            .toBe(400)
    })

    it('Should keep line without area by default', () => {
        expect(buildLine(items => items.line()).areaBaseline)
            .toBeNull()
    })
})