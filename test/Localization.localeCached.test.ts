import { localeCached, setLocalization } from '@/static/Localization'

describe('Caching by locale', () => {
    afterEach(() => setLocalization(undefined, undefined))

    it('Should create the value once per locale', () => {
        const create = jest.fn((locale: string | undefined) => ({ locale }))
        const get = localeCached(create)

        expect(get())
            .toBe(get())
        expect(create)
            .toHaveBeenCalledTimes(1)
    })

    it('Should create the value for the current locale', () => {
        const get = localeCached(locale => locale)

        setLocalization('fr', undefined)

        expect(get())
            .toBe('fr')
    })

    it('Should recreate the value when the locale changes', () => {
        const get = localeCached(locale => locale)

        get()
        setLocalization('de', undefined)

        expect(get())
            .toBe('de')
    })

    it('Should keep the value when only strings change', () => {
        const create = jest.fn(() => ({}))
        const get = localeCached(create)

        get()
        setLocalization(undefined, { reset: 'Clear' })
        get()

        expect(create)
            .toHaveBeenCalledTimes(1)
    })
})