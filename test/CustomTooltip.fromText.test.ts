import CustomTooltip from '@/renderer/CustomTooltip'
import { LIGHT_THEME } from '@/Theme'

describe('Building custom tooltip from text', () => {
    it('Should escape the text', () => {
        expect(CustomTooltip.fromText('<b>Bold</b>', LIGHT_THEME))
            .toContain('&lt;b&gt;Bold&lt;/b&gt;')
    })

    it('Should use the UI font family', () => {
        expect(CustomTooltip.fromText('Tip', LIGHT_THEME))
            .toContain('system-ui, sans-serif')
    })

    it('Should use the glass floating panel style', () => {
        const html = CustomTooltip.fromText('Tip', LIGHT_THEME)

        expect(html)
            .toContain(LIGHT_THEME.floatingBackground)
        expect(html)
            .toContain('border-radius: 12px')
        expect(html)
            .toContain('backdrop-filter: blur(12px)')
        expect(html)
            .toContain('0 8px 32px')
    })
})