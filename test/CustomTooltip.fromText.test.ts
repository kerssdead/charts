import CustomTooltip from '@/renderer/CustomTooltip'
import { LIGHT_THEME } from '@/Theme'

describe('Building custom tooltip from text', () => {
    it('Should escape the text', () => {
        expect(CustomTooltip.fromText('<b>Bold</b>', LIGHT_THEME))
            .toContain('&lt;b&gt;Bold&lt;/b&gt;')
    })
})