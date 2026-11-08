import Export from '@/export/Export'

jest.mock('@/Theme', () => ({ update: () => {}, canvasBackground: '#ffffff', background: '#ffffff' }))

let warn: jest.SpyInstance

let saveAs: jest.SpyInstance

function exportWith(readError: Error) {
    const ctx = {
        drawImage: () => {},
        getImageData: () => {
            throw readError
        }
    }

    const createCanvas = () => ({ width: 0, height: 0, getContext: () => ctx });

    (globalThis as any).document = { createElement: createCanvas };
    (globalThis as any).requestAnimationFrame = (callback: () => void) => callback()

    Export.asPng({ width: 10, height: 10 } as HTMLCanvasElement, { ratio: 1, title: 'Chart' })
}

beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    saveAs = jest.spyOn(Export, 'saveAs').mockResolvedValue()
})

afterEach(() => {
    delete (globalThis as any).document
    delete (globalThis as any).requestAnimationFrame

    warn.mockRestore()
    saveAs.mockRestore()
})

describe('Saving a chart as PNG', () => {
    it('Should warn instead of failing when an image was loaded without CORS', () => {
        exportWith(new DOMException('The canvas has been tainted', 'SecurityError'))

        expect(warn.mock.calls[0][0])
            .toContain('loaded without CORS')
        expect(saveAs)
            .not.toHaveBeenCalled()
    })

    it('Should rethrow other errors', () => {
        expect(() => exportWith(new Error('Broken')))
            .toThrow('Broken')
    })
})