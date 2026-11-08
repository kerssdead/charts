import ChartSettings from '@/types/ChartSettings'

type ProcessSettings = Pick<ChartSettings, 'valuePostfix' | 'decimals'>

export default ProcessSettings