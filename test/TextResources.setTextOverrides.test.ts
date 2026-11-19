import TextResources, { setTextOverrides } from '@/static/TextResources'

describe('Setting text overrides', () => {
    afterEach(() => setTextOverrides(undefined))

    it('Should return default texts without overrides', () => {
        expect([TextResources.noData, TextResources.sortAscending, TextResources.sortDescending])
            .toEqual(['No data', ' ▲', ' ▼'])
    })

    it('Should return overridden text and keep others', () => {
        setTextOverrides({ noData: 'Empty' })

        expect([TextResources.noData, TextResources.total])
            .toEqual(['Empty', 'Total'])
    })

    it('Should replace previous overrides', () => {
        setTextOverrides({ noData: 'Empty' })
        setTextOverrides({ total: 'Sum' })

        expect([TextResources.noData, TextResources.total])
            .toEqual(['No data', 'Sum'])
    })

    it('Should reset overrides', () => {
        setTextOverrides({ noData: 'Empty' })
        setTextOverrides(undefined)

        expect(TextResources.noData)
            .toBe('No data')
    })

    it('Should list every text key', () => {
        expect(Object.keys(TextResources))
            .toContain('somethingWentWrong')
    })
})