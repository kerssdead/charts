import QueueItemBaseBuilder from '@/builders/QueueItemBaseBuilder'
import RenderItemRectangle from '@/types/RenderItemRectangle'

class TestBuilder extends QueueItemBaseBuilder<RenderItemRectangle> {
    constructor() {
        super(new RenderItemRectangle())
    }

    run(update: () => void) {
        return this.chain(update)
    }
}

describe('Chaining builder updates', () => {
    it('Should run the update once', () => {
        const update = jest.fn()

        new TestBuilder().run(update)

        expect(update)
            .toHaveBeenCalledTimes(1)
    })

    it('Should return the same builder', () => {
        const builder = new TestBuilder()

        expect(builder.run(() => {}))
            .toBe(builder)
    })

    it('Should apply the update to the built item', () => {
        const builder = new TestBuilder()

        expect((builder.run(() => builder.shape.isFill = true).build().shape as RenderItemRectangle).isFill)
            .toBe(true)
    })
})