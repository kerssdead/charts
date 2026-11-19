export const SYSTEM_FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

let fontFamily = SYSTEM_FONT_FAMILY

export function getFontFamily() {
    return fontFamily
}

export function setFontFamily(family: string | undefined) {
    fontFamily = family?.trim() || SYSTEM_FONT_FAMILY
}