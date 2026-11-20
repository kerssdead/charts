import { handlers, installPointerEnvironment, pointer } from './PointerTestData'

installPointerEnvironment()

const POINT = { x: 3, y: 4 }

describe('Pointer opening context menu at point', () => {
    it('Should open a context at the point', () => {
        const result = handlers()

        result.hasContextMenuAt = jest.fn(() => true)

        const target = pointer(result)

        expect([target.openContextMenuAt(POINT), target.context, result.onChange.mock.calls.length])
            .toEqual([true, { point: POINT, isOpenedFromButton: false }, 1])
    })

    it('Should not open a context where there is no menu', () => {
        const result = handlers()
        const target = pointer(result)

        expect([target.openContextMenuAt(POINT), target.context, result.onChange.mock.calls.length])
            .toEqual([false, null, 0])
    })
})