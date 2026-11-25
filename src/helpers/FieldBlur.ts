export type Diffusion = {
    sources: Float32Array
    sigmaX: number
    sigmaY: number
}

type Grid = {
    columns: number
    rows: number
}

type Pass = {
    lines: number
    length: number
    step: number
    lineStep: number
}

const REACH_SIGMAS = 3

const MIN_SIGMA = .5

export function diffuse({ sources, sigmaX, sigmaY }: Diffusion, progress: number, { columns, rows }: Grid) {
    const spread = Math.max(Math.sqrt(progress), Math.min(MIN_SIGMA / Math.max(sigmaX, sigmaY), 1))
    const horizontal = new Float32Array(sources.length)
    const result = new Float32Array(sources.length)

    convolve(sources, horizontal, { lines: rows, length: columns, step: 1, lineStep: columns }, sigmaX * spread)
    convolve(horizontal, result, { lines: columns, length: rows, step: columns, lineStep: 1 }, sigmaY * spread)

    return result
}

function convolve(source: Float32Array, result: Float32Array, pass: Pass, sigma: number) {
    const { lines, length, step, lineStep } = pass
    const reach = Math.min(Math.ceil(sigma * REACH_SIGMAS), length - 1)
    const weights = Float32Array.from({ length: reach + 1 }, (_, offset) => {
        return Math.exp(-(offset * offset) / (2 * sigma * sigma))
    })
    const padded = new Float32Array(length + reach * 2)

    for (let line = 0; line < lines; line++) {
        const start = line * lineStep

        for (let position = 0; position < length; position++)
            padded[reach + position] = source[start + position * step]

        for (let center = reach; center < length + reach; center++) {
            let total = padded[center] * weights[0]

            for (let offset = 1; offset <= reach; offset++)
                total += (padded[center - offset] + padded[center + offset]) * weights[offset]

            result[start + (center - reach) * step] = total
        }
    }
}