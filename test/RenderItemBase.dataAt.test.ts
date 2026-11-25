import RenderItemRectangle from '@/types/RenderItemRectangle'

describe('Getting shape data at a point', () => {
    it('Should give no data for a shape without data of its own', () => {
        expect(new RenderItemRectangle().dataAt({ x: 0, y: 0 }))
            .toBeNull()
    })
})