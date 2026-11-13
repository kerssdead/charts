import TableToolbar, { TableToolbarOptions } from '@/export/TableToolbar'
import TextResources from '@/static/TextResources'
import { Events, TableClasses, Tag } from '@/static/Enums'
import { FakeElement, installFakeDocument } from './FakeDocument'

function installClipboard(clipboard: Partial<Clipboard> | undefined) {
    Object.defineProperty(globalThis, 'navigator', { value: { clipboard }, configurable: true })
}

async function flushPromises() {
    for (let i = 0; i < 3; i++)
        await Promise.resolve()
}

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

        expect(toolbar.elements.map(element => {
            return element.tagName === Tag.Input ? element.placeholder : element.textContent
        }))
            .toEqual([TextResources.filter, TextResources.copy, TextResources.saveCsv])
    })

    it('Should hide the filter when filtering is not allowed', () => {
        const { toolbar } = create({ canFilter: false })

        expect(toolbar.findByClass(TableClasses.Filter).length)
            .toBe(0)
    })

    it('Should pass the typed query to the filter callback', () => {
        const onFilter = jest.fn()
        const { toolbar } = create({ onFilter })
        const [filter] = toolbar.elements

        filter.value = 'lem'
        filter.dispatch(Events.Input)

        expect([filter.type, onFilter.mock.calls])
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

        installClipboard({ writeText })

        const { toolbar } = create()
        const copy = toolbar.elements[1]

        copy.click()
        await flushPromises()

        const feedback = copy.textContent

        jest.runAllTimers()

        expect([writeText.mock.calls, feedback, copy.textContent])
            .toEqual([[['text']], TextResources.copied, TextResources.copy])
    })

    it('Should show copy failure when the clipboard rejects the text', async () => {
        jest.useFakeTimers()

        installClipboard({ writeText: () => Promise.reject(new Error('Denied')) })

        const { toolbar } = create()
        const copy = toolbar.elements[1]

        copy.click()
        await flushPromises()

        expect(copy.textContent)
            .toBe(TextResources.copyFailed)
    })

    it('Should show copy failure when the clipboard is unavailable', async () => {
        jest.useFakeTimers()

        installClipboard(undefined)

        const { toolbar } = create()
        const copy = toolbar.elements[1]

        copy.click()
        await flushPromises()

        expect(copy.textContent)
            .toBe(TextResources.copyFailed)
    })

    it('Should restart the feedback timeout on a repeated copy', async () => {
        jest.useFakeTimers()

        installClipboard({ writeText: () => Promise.resolve() })

        const { toolbar } = create()
        const copy = toolbar.elements[1]

        copy.click()
        await flushPromises()
        jest.advanceTimersByTime(1000)

        copy.click()
        await flushPromises()
        jest.advanceTimersByTime(1000)

        const feedback = copy.textContent

        jest.runAllTimers()

        expect([feedback, copy.textContent])
            .toEqual([TextResources.copied, TextResources.copy])
    })
})