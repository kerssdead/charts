const load = () => {
    let text!: typeof import('@/helpers/Text')

    jest.isolateModules(() => {
        text = require('@/helpers/Text')
    })

    return text
}

afterEach(() => {
    delete (globalThis as Record<string, unknown>).document
})

describe('Getting scratch context', () => {
    it('Should create the context once and set the measuring font', () => {
        const ctx = { font: '' }
        const getContext = jest.fn(() => ctx)

        Object.assign(globalThis, { document: { createElement: () => ({ getContext }) } })

        const { scratchContext } = load()

        expect(scratchContext())
            .toBe(scratchContext())
        expect(getContext)
            .toHaveBeenCalledTimes(1)
        expect(ctx.font)
            .toContain('100px')
    })

    it('Should create a one pixel canvas', () => {
        const canvas = { width: 300, height: 150, getContext: () => ({ font: '' }) }

        Object.assign(globalThis, { document: { createElement: () => canvas } })

        load().scratchContext()

        expect([canvas.width, canvas.height])
            .toEqual([1, 1])
    })

    it('Should fail when the canvas has no context', () => {
        Object.assign(globalThis, { document: { createElement: () => ({ getContext: () => null }) } })

        expect(() => load().scratchContext())
            .toThrow()
    })
})
