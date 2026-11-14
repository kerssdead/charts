import { createRouter } from './InputRouterTestScene'

jest.mock('@/renderer/Pointer')

const POINT = { x: 5, y: 5 }

describe('Getting input router position', () => {
    it('Should return the pointer position', () => {
        const { router, pointer } = createRouter()

        pointer.position = POINT

        expect(router.position)
            .toBe(POINT)
    })
})