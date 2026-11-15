import CustomTooltip from '@/renderer/CustomTooltip'
import { installCustomTooltipEnvironment } from './CustomTooltipTestData'

describe('Setting custom tooltip opacity', () => {
    it('Should change the element opacity', () => {
            const { canvas } = installCustomTooltipEnvironment()
    
            const tooltip = new CustomTooltip(canvas)
    
            const opacity = () => {
                const floating = tooltip as unknown as {
                    floating: { element: { style: { opacity: string } } }
                }
    
                return floating.floating.element.style.opacity
            }
    
            tooltip.show('<div>Tip</div>', { x: 0, y: 0 })
            tooltip.setOpacity(.5)
    
            expect(opacity())
                .toBe('0.5')
    
            tooltip.setOpacity(.25)
    
            expect(opacity())
                .toBe('0.25')
        })
})