import ChartSettings from '@/types/ChartSettings'
import { ThemePalette } from '@/Theme'

type ProcessSettings = Pick<ChartSettings, 'valuePostfix' | 'decimals' | 'imageCrossOrigin'> & {
    theme: ThemePalette
}

export default ProcessSettings