import { SYSTEM_FONT_FAMILY } from '@/static/Typography'
import CustomTooltip from '@/renderer/CustomTooltip'
import { LIGHT_THEME } from '@/Theme'

describe('Building custom tooltip from text', () => {
    it('Should escape the text', () => {
        expect(CustomTooltip.fromText('<b>Bold</b>', LIGHT_THEME))
            .toContain('&lt;b&gt;Bold&lt;/b&gt;')
    })

    it('Should use the UI font family', () => {
        expect(CustomTooltip.fromText('Tip', LIGHT_THEME))
            .toContain(SYSTEM_FONT_FAMILY)
    })

    it('Should use an opaque floating panel style without backdrop blur', () => {
        const html = CustomTooltip.fromText('Tip', LIGHT_THEME)

        expect(html)
            .toContain(`background: ${ LIGHT_THEME.background }`)
        expect(html)
            .toContain('border-radius: 12px')
        expect(html)
            .not.toContain('backdrop-filter')
        expect(html)
            .toContain('0 8px 32px')
    })
})