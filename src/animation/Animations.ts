import { clamp } from '@/helpers/Geometry'

const OFFSET = .23

const X1 = 1 - OFFSET, Y1 = OFFSET, X2 = OFFSET, Y2 = 1 - OFFSET

const EPSILON = 1e-6

const NEWTON_ITERATIONS = 8

const bezier = (t: number, p1: number, p2: number) => 3 * (1 - t) * (1 - t) * t * p1 + 3 * (1 - t) * t * t * p2 + t * t * t

const slope = (t: number, p1: number, p2: number) => 3 * (1 - t) * (1 - t) * p1 + 6 * (1 - t) * t * (p2 - p1) + 3 * t * t * (1 - p2)

const SAMPLES = 1024

const TABLE = Float64Array.from({ length: SAMPLES + 1 }, (_, i) => bezier(solve(i / SAMPLES), Y1, Y2))

export default function ease(value: number): number {
    if (value <= 0)
        return 0

    if (value >= 1)
        return 1

    const position = value * SAMPLES
    const index = Math.floor(position)

    return TABLE[index] + (TABLE[index + 1] - TABLE[index]) * (position - index)
}

function solve(x: number): number {
    let t = x

    for (let i = 0; i < NEWTON_ITERATIONS; i++) {
        const error = bezier(t, X1, X2) - x

        if (Math.abs(error) < EPSILON)
            return t

        t = clamp(t - error / slope(t, X1, X2), 0, 1)
    }

    let low = 0, high = 1

    while (high - low > EPSILON) {
        t = (low + high) / 2

        if (bezier(t, X1, X2) < x)
            low = t
        else
            high = t
    }

    return (low + high) / 2
}