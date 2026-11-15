import CanvasWindow from '@/types/CanvasWindow'
import { ThemePalette } from '@/Theme'

type RenderFrame = {
    window: CanvasWindow
    screen: CanvasWindow
    now: DOMHighResTimeStamp
    theme: ThemePalette
}

export default RenderFrame