import { createRouter } from './InputRouterTestScene'

jest.mock('@/renderer/Pointer')

describe('Attaching input router', () => {
    it('Should attach the pointer with the move setting', () => {
        const { router, pointer } = createRouter()

        router.attach(true)

        expect(pointer.attach)
            .toHaveBeenCalledWith(true)
    })
})