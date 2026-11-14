import { createRouter } from './InputRouterTestScene'

jest.mock('@/renderer/Pointer')

const POINT = { x: 5, y: 5 }

describe('Opening menu from input router', () => {
    it('Should open the pointer menu at the point', () => {
        const { router, pointer } = createRouter()

        router.openMenu(POINT)

        expect(pointer.openMenu)
            .toHaveBeenCalledWith(POINT)
    })
})