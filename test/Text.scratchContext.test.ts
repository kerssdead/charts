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

    it('Should fail when the canvas has no context', () => {
        Object.assign(globalThis, { document: { createElement: () => ({ getContext: () => null }) } })

        expect(() => load().scratchContext())
            .toThrow()
    })
})
