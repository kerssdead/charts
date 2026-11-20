import { renewBuffers } from '@/helpers/Canvas'

const canvasWithWidth = (width: number) => {
    const widths: number[] = []
    const canvas = {
        get width() {
            return widths.at(-1) ?? width
        },
        set width(value: number) {
            widths.push(value)
        }
    }

    return { canvas: canvas as unknown as HTMLCanvasElement, widths }
}

describe('Renewing canvas buffers', () => {
    it('Should resize the canvas through zero to drop its buffers', () => {
        const { canvas, widths } = canvasWithWidth(200)

        renewBuffers(canvas)

        expect(widths)
            .toEqual([0, 200])
    })

    it('Should leave a released canvas untouched', () => {
        const { canvas, widths } = canvasWithWidth(0)

        renewBuffers(canvas)

        expect(widths)
            .toEqual([])
    })
})