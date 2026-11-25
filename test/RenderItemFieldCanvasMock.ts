type Bitmap = {
    canvas: { width: number, height: number }
    image: { data: Uint8ClampedArray }
    put: jest.Mock
}

export const bitmaps: Bitmap[] = []

export const canvasModule = () => {
    return {
        ...jest.requireActual('@/helpers/Canvas'),
        createCanvas: () => {
            const canvas = { width: 0, height: 0 }

            bitmaps.push({ canvas, image: { data: new Uint8ClampedArray(0) }, put: jest.fn() })

            return canvas
        },
        getContext: (canvas: { width: number, height: number }) => {
            const bitmap = bitmaps.find(item => item.canvas === canvas) as Bitmap

            return {
                createImageData: (width: number, height: number) => {
                    bitmap.image = { data: new Uint8ClampedArray(width * height * 4) }

                    return bitmap.image
                },
                putImageData: bitmap.put
            }
        }
    }
}

export const pixels = (index = 0) => new Uint32Array(bitmaps[index].image.data.buffer)