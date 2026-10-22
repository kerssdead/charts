import { maxOf } from '@/helpers/Collections'

const NEGLIGIBLE = 0.01

export function getRoundedValues(
    all: number[],
    targetTicks: number = 5,
    max?: number
) {
    if (!Array.isArray(all) || all.length === 0 || targetTicks < 2) {
        return []
    }

    const lowest = all.reduce((acc, value) => Math.min(acc, value), 0)
    const highest = maxOf(all, value => value)

    if (!Number.isFinite(lowest) || !Number.isFinite(highest) || lowest === 0 && highest === 0) {
        return []
    }

    const minVal = -lowest < highest * NEGLIGIBLE ? 0 : lowest
    const maxVal = highest < -lowest * NEGLIGIBLE ? 0 : highest

    const intervals = targetTicks - 1

    const ticks = (start: number, step: number) =>
        Array.from({ length: targetTicks }, (_, i) => Number((start + i * step).toFixed(12)) || 0)

    if (max != undefined && max > 0) {
        const lower = Math.abs(minVal)

        let neg = 0

        while (neg < intervals - 1 && neg * max / (intervals - neg) < lower)
            neg++

        const fixedStep = Math.max(max / (intervals - neg), neg == 0 ? 0 : lower / neg)

        return ticks(-neg * fixedStep, fixedStep)
    }

    const rawStep = (maxVal - minVal) / intervals

    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
    const normalizedStep = rawStep / magnitude

    const niceSteps = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]

    const intervalsFor = (step: number) => ({
        neg: minVal < 0 ? Math.ceil(Math.abs(minVal) / step) : 0,
        pos: maxVal > 0 ? Math.ceil(maxVal / step) : 0
    })

    const isFit = (step: number) => {
        const { neg, pos } = intervalsFor(step)

        return neg + pos <= intervals
    }

    const prettyNormalizedStep = niceSteps.find(nice => nice >= normalizedStep && isFit(nice * magnitude)) ?? 10

    const countsFor = (step: number) => {
        const { neg, pos } = intervalsFor(step)

        return { neg, pos: maxVal > 0 ? Math.max(pos, 1) : pos }
    }

    let step = prettyNormalizedStep * magnitude
    let counts = countsFor(step)

    while (counts.neg + counts.pos > intervals) {
        step *= 1.25
        counts = countsFor(step)
    }

    let { neg: negIntervals, pos: posIntervals } = counts

    const remaining = intervals - negIntervals - posIntervals

    if (minVal === 0) {
        posIntervals += remaining
    } else if (maxVal === 0) {
        negIntervals += remaining
    } else {
        for (let i = 0; i < remaining; i++) {
            const negDeficit = negIntervals * step - Math.abs(minVal)
            const posDeficit = posIntervals * step - maxVal

            if (negDeficit < posDeficit)
                negIntervals++
            else
                posIntervals++
        }
    }

    return ticks(-negIntervals * step, step)
}

const NUMBER_PATTERN = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i

const GROUP_SPACES = /[\s\u00a0\u202f'\u2019_]/g

const MINUS = /^[-\u2212]/

let localeGroup: string | undefined

function isGrouping(text: string, separator: string) {
    localeGroup ??= new Intl.NumberFormat().formatToParts(1000).find(part => part.type == 'group')?.value ?? ','

    const [integer, fraction] = text.split(separator)

    return separator == localeGroup && /^[1-9]\d{0,2}$/.test(integer) && /^\d{3}$/.test(fraction)
}

export function parseNumber(value: string | number | null | undefined): number {
    if (value == null || value === '')
        return 0

    if (typeof value == 'number')
        return value

    let text = String(value).replace(GROUP_SPACES, '')
    let sign = 1

    if (MINUS.test(text)) {
        sign = -1
        text = text.slice(1)
    } else if (text.startsWith('+')) {
        text = text.slice(1)
    }

    const lastDot = text.lastIndexOf('.')
    const lastComma = text.lastIndexOf(',')

    let decimal: string | null = null

    if (lastDot >= 0 && lastComma >= 0) {
        decimal = lastDot > lastComma ? '.' : ','
    } else if (lastDot >= 0 || lastComma >= 0) {
        const separator = lastDot >= 0 ? '.' : ','
        const isSingle = text.indexOf(separator) == text.lastIndexOf(separator)

        decimal = isSingle && !isGrouping(text, separator) ? separator : null
    }

    let normalized = text.replace(decimal == '.' ? /,/g : decimal == ',' ? /\./g : /[.,]/g, '')

    if (decimal == ',')
        normalized = normalized.replace(',', '.')

    return NUMBER_PATTERN.test(normalized) ? sign * Number(normalized) : NaN
}