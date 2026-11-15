import { ThemePalette } from '@/Theme'

type RendererTheme = {
    getPalette: () => ThemePalette
    sync: () => boolean
}

export default RendererTheme