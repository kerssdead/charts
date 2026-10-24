import ProcessSettings from '@/types/ProcessSettings'
import ChartSettings from '@/types/ChartSettings'

type PieProcessSettings = ProcessSettings & Pick<ChartSettings, 'enableOther'>

export default PieProcessSettings