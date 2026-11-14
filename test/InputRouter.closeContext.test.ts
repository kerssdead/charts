import { createRouter } from './InputRouterTestScene'

jest.mock('@/renderer/Pointer')

describe('Closing context from input router', () => {
    it('Should close the pointer context', () => {
        const { router, pointer } = createRouter()

        router.closeContext()

        expect(pointer.closeContext)
            .toHaveBeenCalledTimes(1)
    })
})