export type LeaderStart = {
    x: number
    y: number
    angle: number
    distance: number
    lift: number
}

export default interface LeaderOrigin {
    leaderOrigin(): LeaderStart
}