import QueueRectangleItemBuilder from '@/builders/QueueRectangleItemBuilder'

describe('Giving builder item its own appear duration', () => {
    it('Should keep the duration', () => {
        expect(new QueueRectangleItemBuilder().appearDuration(900).build().animation.appearDuration)
            .toBe(900)
    })

    it('Should use the transition duration by default', () => {
        expect(new QueueRectangleItemBuilder().build().animation.appearDuration)
            .toBe(0)
    })
})