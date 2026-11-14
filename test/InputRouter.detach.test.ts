import { createRouter } from './InputRouterTestScene'

jest.mock('@/renderer/Pointer')

describe('Detaching input router', () => {
    it('Should detach the pointer', () => {
        const { router, pointer } = createRouter()

        router.detach()

        expect(pointer.detach)
            .toHaveBeenCalledTimes(1)
    })
})