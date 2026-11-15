import CustomTooltip from '@/renderer/CustomTooltip'
import { installCustomTooltipEnvironment } from './CustomTooltipTestData'

describe('Hiding custom tooltip', () => {
    it('Should hide the element', () => {
            const { body, canvas } = installCustomTooltipEnvironment()
    
            const tooltip = new CustomTooltip(canvas)
    
            tooltip.show('<div>Tip</div>', { x: 0, y: 0 })
            tooltip.hide()
    
            expect(body.elements.find(element => element.getAttribute('role') === 'tooltip'))
                .toBeUndefined()
            expect((tooltip as unknown as { floating: unknown }).floating)
                .toBeNull()
        })
})