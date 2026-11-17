import CustomTooltip from '@/renderer/CustomTooltip'
import { installCustomTooltipEnvironment } from './CustomTooltipTestData'

describe('Showing custom tooltip', () => {
    it('Should show the html in a floating element', () => {
            const { body, canvas } = installCustomTooltipEnvironment()

            const tooltip = new CustomTooltip(canvas)

            tooltip.show('<div>Tip</div>', { x: 10, y: 20 })

            const element = body.elements.find(element => element.getAttribute('role') === 'tooltip')

            expect(element)
                .toBeDefined()
            expect(element?.innerHTML)
                .toBe('<div>Tip</div>')
            expect(element?.style.pointerEvents)
                .toBe('none')
        })

        it('Should reuse the element for the same html', () => {
            const { body, canvas } = installCustomTooltipEnvironment()

            const tooltip = new CustomTooltip(canvas)

            tooltip.show('<div>Tip</div>', { x: 10, y: 20 })
            tooltip.show('<div>Tip</div>', { x: 30, y: 40 })

            expect(body.elements.filter(element => element.getAttribute('role') === 'tooltip'))
                .toHaveLength(1)
        })

        it('Should reuse the element when the html changes', () => {
            const { body, canvas } = installCustomTooltipEnvironment()

            const tooltip = new CustomTooltip(canvas)

            tooltip.show('<div>First</div>', { x: 10, y: 20 })
            tooltip.show('<div>Second</div>', { x: 30, y: 40 })

            const elements = body.elements.filter(element => element.getAttribute('role') === 'tooltip')

            expect(elements)
                .toHaveLength(1)
            expect(elements[0].innerHTML)
                .toBe('<div>Second</div>')
        })
})