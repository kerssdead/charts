const LINEAR_MULTIPLIERS = [1, 2, 2.5, 5, 10]

const MAX_LOG_TICKS = 10

export function getNiceStep(rawStep: number, multipliers: number[] = LINEAR_MULTIPLIERS) {
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))

    return (multipliers.find(multiplier => multiplier * magnitude >= rawStep) ?? 10) * magnitude
}

export function getLinearTicks(min: number, max: number, targetTicks: number) {
    if (max <= min)
        return [min]

    const step = getNiceStep((max - min) / Math.max(targetTicks - 1, 1))
    const first = Math.ceil(min / step)
    const last = Math.floor(max / step)

    return Array.from({ length: last - first + 1 }, (_, i) => Number(((first + i) * step).toFixed(12)) || 0)
}

export function getLogAxisValues(all: number[], max?: number) {
    const positive = all.filter(value => value > 0 && Number.isFinite(value))

    if (positive.length == 0)
        return []

    const largest = positive.reduce((acc, value) => Math.max(acc, value))
    const smallest = positive.reduce((acc, value) => Math.min(acc, value))

    const top = max != undefined && max > 0
                ? max
                : powerOfTen(Math.ceil(Math.log10(largest)))

    const topExponent = Math.log10(top)
    const lowExponent = Math.min(Math.floor(Math.log10(smallest)), Math.ceil(topExponent) - 1)
    const every = Math.ceil((Math.ceil(topExponent) - lowExponent) / (MAX_LOG_TICKS - 1))

    const ticks: number[] = []

    for (let exponent = lowExponent; exponent < topExponent; exponent += every)
        ticks.push(powerOfTen(exponent))

    return [...ticks, top]
}

export function getLogTicksBetween(min: number, max: number) {
    const ticks: number[] = []

    for (let exponent = Math.ceil(Math.log10(min)); exponent <= Math.floor(Math.log10(max)); exponent++)
        ticks.push(powerOfTen(exponent))

    return ticks.length < 2 ? [min, max] : ticks
}

function powerOfTen(exponent: number) {
    return Number(`1e${ exponent }`)
}