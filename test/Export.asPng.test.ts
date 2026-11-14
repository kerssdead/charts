import Export from '@/export/Export'

jest.mock('@/Theme', () => ({
    update: () => {},
    canvasBackground: '#000000',
    canvasBackgroundInt: 0,
    background: '#ffffff'
}))

const createPixelData = (width: number, emptyRanges: [number, number][]) => {
    const bytes = new Uint8ClampedArray(width * 4).fill(255)

    for (const [start, end] of emptyRanges)
        for (let i = start; i < end; i++)
            for (let channel = 0; channel < 4; channel++)
                bytes[i * 4 + channel] = 0

    return bytes
}

let pixels: Uint8ClampedArray

let readError: Error | null = null

const ctx = {
    drawImage: jest.fn(),
    setTransform: jest.fn(),
    fillStyle: '',
    fillRect: jest.fn(),
    getImageData: jest.fn(() => {
        if (readError)
            throw readError

        return { data: pixels }
    })
}

class FakeCanvas {
    width = 16

    height = 1

    style = {}

    toBlob = jest.fn((callback: (blob: Blob | null) => void) => callback(new Blob(['png'])))

    getContext = jest.fn(() => ctx)
}

let warn: jest.SpyInstance

let saveAs: jest.SpyInstance

function exportAsPng(title: string = 'Chart') {
    Export.asPng(new FakeCanvas() as unknown as HTMLCanvasElement, {
        ratio: 1,
        title,
        exclude: { x: 1, y: 0, width: 2, height: 1 } as DOMRect
    })
}

beforeEach(() => {
    pixels = createPixelData(16, [[0, 6], [10, 16]])
    readError = null

    Object.assign(globalThis, {
        document: { createElement: () => new FakeCanvas() },
        requestAnimationFrame: (callback: FrameRequestCallback) => callback(0)
    })

    warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    saveAs = jest.spyOn(Export, 'saveAs').mockResolvedValue()
})

afterEach(() => {
    delete (globalThis as Record<string, unknown>).document
    delete (globalThis as Record<string, unknown>).requestAnimationFrame

    warn.mockRestore()
    saveAs.mockRestore()
})

describe('Saving a chart as PNG', () => {
    it('Should trim empty edges and save the image', () => {
        exportAsPng()

        expect(ctx.setTransform)
            .toHaveBeenCalledWith(1, 0, 0, 1, 0, 0)
        expect(saveAs)
            .toHaveBeenCalledWith('Chart.png', expect.any(Blob), { accept: { 'image/png': '.png' } })
    })

    it('Should use the default image name without a title', () => {
        exportAsPng('')

        expect(saveAs.mock.calls[0][0])
            .toMatch(/.+\.png$/)
    })

    it('Should warn instead of failing when an image was loaded without CORS', () => {
        readError = new DOMException('The canvas has been tainted', 'SecurityError')

        exportAsPng()

        expect(warn.mock.calls[0][0])
            .toContain('loaded without CORS')
        expect(saveAs)
            .not.toHaveBeenCalled()
    })

    it('Should rethrow other errors', () => {
        readError = new Error('Broken')

        expect(() => exportAsPng())
            .toThrow('Broken')
    })
})
