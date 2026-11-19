export type Metrics = {
    create: number

    initFrameAvg: number

    hoverFrameAvg: number

    hoverExtra: number

    idleFrames: number

    update: number

    updateFrameAvg: number
}

export type MetricKey = keyof Metrics

export const METRIC_KEYS: MetricKey[] = [
    'create',
    'initFrameAvg',
    'hoverFrameAvg',
    'hoverExtra',
    'idleFrames',
    'update',
    'updateFrameAvg'
]