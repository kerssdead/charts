import fs from 'fs'
import path from 'path'
import { METRIC_KEYS, MetricKey, Metrics } from './Metrics'
import { CPU_SLOWDOWN, SCALE } from './Benchmark'

type BaselineFile = {
    scale: number

    cpuSlowdown: number

    scenarios: Record<string, Metrics>
}

export const TOLERANCE = 2

const FLOOR: Record<MetricKey, number> = {
    create: 200,
    initFrameAvg: 8,
    hoverFrameAvg: 8,
    hoverExtra: 60,
    idleFrames: 3,
    update: 25,
    updateFrameAvg: 15
}

const BASELINE_PATH = path.resolve(__dirname, '../performance-baseline.json')

export const isUpdating = () => !!process.env.UPDATE_PERFORMANCE_BASELINE

function read(): BaselineFile {
    if (!fs.existsSync(BASELINE_PATH))
        return { scale: SCALE, cpuSlowdown: CPU_SLOWDOWN, scenarios: {} }

    return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'))
}

export function readScenario(scenario: string): Metrics | undefined {
    return read().scenarios[scenario]
}

export function writeScenario(scenario: string, metrics: Metrics) {
    const file = read()

    file.scale = SCALE
    file.cpuSlowdown = CPU_SLOWDOWN
    file.scenarios[scenario] = metrics

    fs.writeFileSync(BASELINE_PATH, JSON.stringify(file, null, 4))
}

const limit = (baseline: Metrics, key: MetricKey) => baseline[key] * TOLERANCE + FLOOR[key]

export function findRegressions(baseline: Metrics, actual: Metrics): string[] {
    return METRIC_KEYS
        .filter(key => actual[key] > limit(baseline, key))
        .map(key => {
            const expected = baseline[key].toFixed(2)
            const allowed = limit(baseline, key).toFixed(2)

            return `${ key }: ${ actual[key].toFixed(2) } (baseline ${ expected }, limit ${ allowed })`
        })
}