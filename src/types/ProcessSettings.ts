import ChartSettings from '@/types/ChartSettings'

type ProcessSettings = Pick<ChartSettings, 'valuePostfix' | 'decimals' | 'imageCrossOrigin'>

export default ProcessSettings