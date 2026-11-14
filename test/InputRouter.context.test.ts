import { createRouter } from './InputRouterTestScene'

jest.mock('@/renderer/Pointer')

describe('Getting input router context', () => {
    it('Should return the pointer context', () => {
        const { router, pointer } = createRouter()

        const context = {}

        pointer.context = context

        expect(router.context)
            .toBe(context)
    })
})