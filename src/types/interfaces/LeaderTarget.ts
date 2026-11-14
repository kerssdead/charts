import CanvasWindow from '@/types/CanvasWindow'

export type LeaderBox = {
    x: number
    y: number
    halfWidth: number
    halfHeight: number
}

export default interface LeaderTarget {
    leaderBox(window: CanvasWindow, morph: number): LeaderBox
}