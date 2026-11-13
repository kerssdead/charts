import CanvasWindow from '@/types/CanvasWindow'

export const WINDOW = new CanvasWindow(500, 500)

export const context = (ratio: number = 1) => ({
    lineWidth: 1,
    fillStyle: '',
    strokeStyle: '',
    setLineDash: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    bezierCurveTo: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    beginPath: jest.fn(),
    getTransform: () => ({ a: ratio }),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn()
})

export const layerContext = () => {
    const layer = {
        canvas: {},
        fillStyle: null as unknown,
        globalCompositeOperation: 'source-over',
        maskOperations: [] as string[],
        setTransform: jest.fn(),
        clearRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        bezierCurveTo: jest.fn(),
        closePath: jest.fn(),
        fill: jest.fn(),
        fillRect: jest.fn(),
        createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() }))
    }

    layer.fillRect.mockImplementation(() => layer.maskOperations.push(layer.globalCompositeOperation))

    return layer
}

export const STOPS = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 10 }]

export const AREA_STOPS = [{ x: 100, y: 200 }, { x: 300, y: 100 }, { x: 500, y: 200 }]

export const CLIP = { x: 100, y: 200, width: 1000, height: 2000 }