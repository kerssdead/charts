import RenderItemImage from '@/types/RenderItemImage'
import CanvasWindow from '@/types/CanvasWindow'

export const WINDOW = new CanvasWindow(1000, 1000)

export const image = () => {
    const result = new RenderItemImage('chart.png')

    result.absolute = { x: 1000, y: 2000 }
    result.size = 500

    return result
}

export const context = () => {
    return {
        arc: jest.fn(),
        fill: jest.fn(),
        save: jest.fn(),
        clip: jest.fn(),
        drawImage: jest.fn(),
        restore: jest.fn()
    }
}