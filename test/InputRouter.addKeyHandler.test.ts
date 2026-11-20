import { createRouter } from './InputRouterTestScene'

jest.mock('@/renderer/Pointer')

const key = { key: 'x' } as KeyboardEvent

describe('Adding key handler to input router', () => {
    it('Should not handle keys without handlers', () => {
        const { handlers } = createRouter()

        expect(handlers.onKeyDown(key))
            .toBe(false)
    })

    it('Should pass the event to handlers until one handles it', () => {
        const { router, handlers } = createRouter()
        const first = jest.fn(() => false)
        const second = jest.fn(() => true)
        const third = jest.fn(() => true)

        router.addKeyHandler(first)
        router.addKeyHandler(second)
        router.addKeyHandler(third)

        expect([handlers.onKeyDown(key), first.mock.calls, second.mock.calls, third.mock.calls])
            .toEqual([true, [[key]], [[key]], []])
    })

    it('Should report handler errors and leave the key unhandled', () => {
        const { router, handlers, onError } = createRouter()
        const error = new Error('Broken')

        router.addKeyHandler(() => {
            throw error
        })

        expect([handlers.onKeyDown(key), onError.mock.calls])
            .toEqual([false, [[error]]])
    })
})