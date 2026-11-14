import { createRouter } from './InputRouterTestScene'

jest.mock('@/renderer/Pointer')

describe('Setting input router scrollable', () => {
    it('Should pass scrollability to the pointer', () => {
        const { router, pointer } = createRouter()

        router.setScrollable(true)

        expect(pointer.setScrollable)
            .toHaveBeenCalledWith(true)
    })
})