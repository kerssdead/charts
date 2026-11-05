import TableToolbar, { TableToolbarOptions } from '@/export/TableToolbar'
import TextResources from '@/static/TextResources'
import { Events, TableClasses, Tag } from '@/static/Enums'
import { FakeElement, installFakeDocument } from './FakeDocument'

function create(options: Partial<TableToolbarOptions> = {}) {
    installFakeDocument()

    const callbacks = {
        canFilter: true,
        onFilter: jest.fn(),
        getText: jest.fn(() => 'text'),
        onSave: jest.fn(),
        ...options
    }

    const toolbar = TableToolbar.create(callbacks) as unknown as FakeElement

    return { toolbar, callbacks }
}

describe('Creating table toolbar', () => {
    afterEach(() => jest.useRealTimers())

    it('Should show filter, copy and save controls', () => {
        const { toolbar } = create()

        expect(toolbar.elements.map(element => element.tagName == Tag.Input ? element.placeholder : element.textContent))
            .toEqual([TextResources.filter, TextResources.copy, TextResources.saveCsv])
    })

    it('Should hide the filter when filtering is not allowed', () => {
        const { toolbar } = create({ canFilter: false })

        expect(toolbar.findByClass(TableClasses.Filter).length)
            .toBe(0)
    })

    it('Should pass the typed query to the filter callback', () => {
        const { toolbar, callbacks } = create()
        const [filter] = toolbar.elements

        filter.value = 'lem'
        filter.dispatch(Events.Input)

        expect([filter.type, callbacks.onFilter.mock.calls])
            .toEqual(['search', [['lem']]])
    })

    it('Should call the save callback', () => {
        const { toolbar, callbacks } = create()

        toolbar.elements[2].click()

        expect(callbacks.onSave)
            .toHaveBeenCalledTimes(1)
    })

    it('Should copy the text and show feedback until the timeout', async () => {
        jest.useFakeTimers()

        const writeText = jest.fn(() => Promise.resolve())

        Object.defineProperty(globalThis, 'navigator', { value: { clipboard: { writeText } }, configurable: true })

        const { toolbar } = create()
        const copy = toolbar.elements[1]

        copy.click()
        await Promise.resolve()

        const feedback = copy.textContent

        jest.runAllTimers()

        expect([writeText.mock.calls, feedback, copy.textContent])
            .toEqual([[['text']], TextResources.copied, TextResources.copy])
    })
})