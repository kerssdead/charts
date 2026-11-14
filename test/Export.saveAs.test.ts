import Export from '@/export/Export'
import { FakeElement, installFakeDocument } from './FakeDocument'
import { Tag } from '@/static/Enums'

const BLOB = new Blob(['payload'])

afterEach(() => {
    jest.useRealTimers()
    delete (globalThis as Record<string, unknown>).window
    delete (globalThis as Record<string, unknown>).document
})

describe('Saving files with a file picker', () => {
    it('Should write the blob to the picked file', async () => {
        const writable = {
            write: jest.fn().mockResolvedValue(undefined),
            close: jest.fn().mockResolvedValue(undefined)
        }
        const fileHandle = { createWritable: jest.fn().mockResolvedValue(writable) }

        Object.assign(globalThis, {
            window: { showSaveFilePicker: jest.fn().mockResolvedValue(fileHandle) }
        })

        await Export.saveAs('name.png', BLOB, { accept: { 'image/png': '.png' } })

        expect(window.showSaveFilePicker)
            .toHaveBeenCalledWith({
                suggestedName: 'name.png',
                types: [{ accept: { 'image/png': '.png' } }],
                excludeAcceptAllOption: true
            })
        expect(fileHandle.createWritable)
            .toHaveBeenCalled()
        expect(writable.write)
            .toHaveBeenCalledWith(BLOB)
        expect(writable.close)
            .toHaveBeenCalled()
    })

    it('Should ignore an aborted picker', async () => {
        Object.assign(globalThis, {
            window: { showSaveFilePicker: jest.fn().mockRejectedValue(new DOMException('aborted', 'AbortError')) }
        })

        await expect(Export.saveAs('name.png', BLOB, { accept: {} }))
            .resolves.toBeUndefined()
    })

    it('Should report a failed save', async () => {
        const consoleError = jest.spyOn(console, 'error').mockImplementation()

        Object.assign(globalThis, {
            window: { showSaveFilePicker: jest.fn().mockRejectedValue(new Error('denied')) }
        })

        await Export.saveAs('name.png', BLOB, { accept: {} })

        expect(consoleError)
            .toHaveBeenCalledWith(new Error('denied'))
    })
})

describe('Saving files without a file picker', () => {
    it('Should download the blob through an anchor', () => {
        const url = 'blob:file'
        const createObjectURL = jest.fn(() => url)
        const revokeObjectURL = jest.fn()
        const originalUrl = globalThis.URL

        Object.assign(globalThis, {
            window: {},
            URL: { createObjectURL, revokeObjectURL }
        })

        installFakeDocument()

        const createElement = jest.spyOn(document, 'createElement')

        jest.useFakeTimers()

        Export.saveAs('file.csv', BLOB, { accept: {} })

        expect(createObjectURL)
            .toHaveBeenCalledWith(BLOB)

        const anchor = createElement.mock.results
            .map(result => result.value)
            .find(element => element?.tagName === Tag.A) as FakeElement

        expect(anchor.href)
            .toBe(url)
        expect(anchor.download)
            .toBe('file.csv')

        jest.runAllTimers()

        expect(revokeObjectURL)
            .toHaveBeenCalledWith(url)

        globalThis.URL = originalUrl
    })
})
