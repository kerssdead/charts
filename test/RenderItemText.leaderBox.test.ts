import CanvasWindow from '@/types/CanvasWindow'
import RenderItemText from '@/types/RenderItemText'

jest.mock('@/helpers/Text', () => ({
    ...jest.requireActual('@/helpers/Text'),
    stringWidth: (text: string) => text.length * 10
}))

const CENTER = 2500

const WINDOW = new CanvasWindow(5000, 5000)

const SMALL_WINDOW = new CanvasWindow(2500, 2500)

const label = (angle: number) => {
    const result = new RenderItemText('label')

    result.angle = angle
    result.fontSize = 14
    result.orbit = { x: CENTER, y: CENTER, radiusX: 1000, radiusY: 1000 }

    return result
}

const settledBox = (text: RenderItemText, window: CanvasWindow) => {
    text.adjust(window)

    return text.orbitBox()
}

describe('Getting leader box', () => {
    it('Should return the orbit box of the label', () => {
        expect(label(.5).leaderBox(WINDOW, 1))
            .toEqual(settledBox(label(.5), WINDOW))
    })

    it('Should place the box in the given window', () => {
        const text = label(.5)

        text.adjust(WINDOW)

        expect(text.leaderBox(SMALL_WINDOW, 1))
            .toEqual(settledBox(label(.5), SMALL_WINDOW))
    })

    it('Should follow the label morph', () => {
        const previous = label(.5)
        const next = label(2)

        previous.adjust(WINDOW)
        next.morphFrom(previous, 1)

        expect(next.leaderBox(WINDOW, 0))
            .toEqual(settledBox(label(.5), WINDOW))
    })
})