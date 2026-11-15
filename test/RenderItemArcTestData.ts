import RenderItemArc from '@/types/RenderItemArc'
import CanvasWindow from '@/types/CanvasWindow'

export const WINDOW = new CanvasWindow(5000, 5000)

export const arc = () => {
    const result = new RenderItemArc()

    result.absolute = { x: 2500, y: 2500 }
    result.radius = 500

    return result
}

export const context = () => ({
    fillStyle: '',
    strokeStyle: '',
    createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
    arc: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    beginPath: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn()
})