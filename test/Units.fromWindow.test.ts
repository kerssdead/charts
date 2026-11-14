import Units from '@/helpers/Units'
import CanvasWindow from '@/types/CanvasWindow'

describe('Creating units from a window', () => {
    it('Should convert window positions to coordinates', () => {
        const window = new CanvasWindow(1000, 500)

        window.x = 100
        window.y = 50

        const units = Units.fromWindow(window)

        expect(units.positionX(600))
            .toBe(2500)
        expect(units.positionY(300))
            .toBe(2500)
        expect(units.toPxX(2500))
            .toBe(500)
        expect(units.toPxY(2500))
            .toBe(250)
    })
})
