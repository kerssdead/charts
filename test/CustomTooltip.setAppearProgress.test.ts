import CustomTooltip from '@/renderer/CustomTooltip'
import { installCustomTooltipEnvironment } from './CustomTooltipTestData'

describe('Setting custom tooltip appear progress', () => {
    it('Should change the element opacity and scale', () => {
        const { canvas } = installCustomTooltipEnvironment()
        const tooltip = new CustomTooltip(canvas)
        const style = () => {
            const floating = tooltip as unknown as {
                floating: { element: { style: { opacity: string, transform: string } } }
            }

            return floating.floating.element.style
        }

        tooltip.show('<div>Tip</div>', { x: 0, y: 0 })

        tooltip.setAppearProgress(0)

        expect([style().opacity, style().transform])
            .toEqual(['0', 'scale(1.05)'])

        tooltip.setAppearProgress(.5)

        expect([style().opacity, style().transform])
            .toEqual(['0.5', 'scale(1.025)'])

        tooltip.setAppearProgress(1)

        expect([style().opacity, style().transform])
            .toEqual(['1', 'scale(1)'])
    })

    it('Should do nothing while the tooltip is hidden', () => {
        const { canvas } = installCustomTooltipEnvironment()
        const tooltip = new CustomTooltip(canvas)

        expect(() => tooltip.setAppearProgress(.5))
            .not.toThrow()
    })
})