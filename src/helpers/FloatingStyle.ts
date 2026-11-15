const PANEL_SHADOW_LIGHT = 'inset 0 1px 0 rgb(255 255 255 / .9), 0 8px 32px rgb(30 40 60 / .08)'

const PANEL_SHADOW_DARK = 'inset 0 1px 0 rgb(255 255 255 / .18), 0 8px 32px rgb(0 0 0 / .35)'

export const FLOATING_PANEL_BLUR = 'blur(12px)'

export function floatingPanelShadow(isDark: boolean) {
    return isDark ? PANEL_SHADOW_DARK : PANEL_SHADOW_LIGHT
}
