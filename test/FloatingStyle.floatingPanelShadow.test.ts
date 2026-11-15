import { FLOATING_PANEL_BLUR, floatingPanelShadow } from '@/helpers/FloatingStyle'

describe('Getting floating panel shadow', () => {
    it('Should use the glass blur and theme shadows', () => {
        expect(FLOATING_PANEL_BLUR)
            .toBe('blur(12px)')
        expect(floatingPanelShadow(false))
            .toContain('rgb(30 40 60 / .08)')
        expect(floatingPanelShadow(true))
            .toContain('rgb(0 0 0 / .35)')
    })
})
