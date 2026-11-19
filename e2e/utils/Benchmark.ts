import { Page } from '@playwright/test'
import { pathToFileURL } from 'url'
import path from 'path'
import { Metrics } from './Metrics'

type FrameSummary = { avg: number, p95: number }

type BenchmarkResult = {
    create: number
    init: FrameSummary
    hover: FrameSummary
    hoverExtra: number
    idle: number
    update: number
    updated: FrameSummary
}

export const SCALE = 1

export const SCENARIOS = [
    'Plot · lines',
    'Plot · columns',
    'Plot · stacked',
    'Pie',
    'Treemap',
    'Segmented bar',
    'Tree bar',
    'Grid · 9 charts'
]

export const CPU_SLOWDOWN = 20

const RUNS = 1

const PAGE_URL = pathToFileURL(path.resolve(__dirname, '../../example/benchmark.html')).href
    + '?init=100&moves=2&settle=50&idle=80&update=60'

const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]

function toMetrics(result: BenchmarkResult): Metrics {
    return {
        create: result.create,
        initFrameAvg: result.init.avg,
        hoverFrameAvg: result.hover.avg,
        hoverExtra: result.hoverExtra,
        idleFrames: result.idle,
        update: result.update,
        updateFrameAvg: result.updated.avg
    }
}

async function runOnce(page: Page, scenario: string): Promise<Metrics> {
    await page.goto(PAGE_URL)
    await page.waitForFunction(() => (window as any).benchmark)

    const session = await page.context().newCDPSession(page)

    await session.send('Emulation.setCPUThrottlingRate', { rate: CPU_SLOWDOWN })

    const result = await page.evaluate(
        ([name, scale]) => (window as any).benchmark.measure(name, scale),
        [scenario, SCALE]
    ) as BenchmarkResult

    return toMetrics(result)
}

export async function measureScenario(page: Page, scenario: string): Promise<Metrics> {
    const runs: Metrics[] = []

    for (let i = 0; i < RUNS; i++)
        runs.push(await runOnce(page, scenario))

    const keys = Object.keys(runs[0]) as Array<keyof Metrics>

    return Object.fromEntries(
        keys.map(key => [key, median(runs.map(run => run[key]))])
    ) as Metrics
}