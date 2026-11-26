import Queue from '@/render/Queue'
import CanvasWindow from '@/types/CanvasWindow'
import Point from '@/types/Point'
import PointerContext from '@/types/PointerContext'
import { ThemePalette } from '@/Theme'

type Frame = {
    queue: Queue
    window: CanvasWindow
    screen: CanvasWindow
    mouse: Point | null
    context: PointerContext | null
    now: DOMHighResTimeStamp
    theme: ThemePalette
    isInstant: boolean
}

export default Frame