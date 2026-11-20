const PANEL_HIGHLIGHT_LIGHT = 'inset 0 1px 0 rgb(255 255 255 / .9)'

const PANEL_HIGHLIGHT_DARK = 'inset 0 1px 0 rgb(255 255 255 / .18)'

const PANEL_DROP_SHADOW_LIGHT = '0 8px 32px rgb(30 40 60 / .08)'

const PANEL_DROP_SHADOW_DARK = '0 8px 32px rgb(0 0 0 / .35)'

export const FLOATING_PANEL_BLUR = 'blur(12px)'

export function floatingPanelHighlight(isDark: boolean) {
    return isDark ? PANEL_HIGHLIGHT_DARK : PANEL_HIGHLIGHT_LIGHT
}

export function floatingPanelShadow(isDark: boolean) {
    const dropShadow = isDark ? PANEL_DROP_SHADOW_DARK : PANEL_DROP_SHADOW_LIGHT

    return `${ floatingPanelHighlight(isDark) }, ${ dropShadow }`
}
