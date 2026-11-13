const NEGLIGIBLE = 0.01

const NICE_STEPS = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]

type ValueRange = {
    min: number
    max: number
}

type IntervalCounts = {
    neg: number
    pos: number
}

export function getRoundedValues(all: number[], targetTicks: number = 5, max?: number) {
    if (!Array.isArray(all) || all.length === 0 || targetTicks < 2)
        return []

    const range = getValueRange(all)

    if (!range)
        return []

    if (max !== undefined && max > 0)
        return getFixedMaxTicks(range.min, max, targetTicks)

    const intervals = targetTicks - 1

    let step = getNiceStep(range, intervals)
    let counts = getStepCounts(range, step)

    while (counts.neg + counts.pos > intervals) {
        step *= 1.25
        counts = getStepCounts(range, step)
    }

    const { neg } = distributeRemaining(range, step, counts, intervals - counts.neg - counts.pos)

    return getTicks(-neg * step, step, targetTicks)
}

function getTicks(start: number, step: number, count: number) {
    return Array.from({ length: count }, (_, i) => Number((start + i * step).toFixed(12)) || 0)
}

function getValueRange(all: number[]): ValueRange | null {
    const lowest = all.reduce((acc, value) => Math.min(acc, value), 0)
    const highest = all.reduce((acc, value) => Math.max(acc, value), 0)

    if (!Number.isFinite(lowest) || !Number.isFinite(highest) || lowest === 0 && highest === 0)
        return null

    return {
        min: -lowest < highest * NEGLIGIBLE ? 0 : lowest,
        max: highest < -lowest * NEGLIGIBLE ? 0 : highest
    }
}

function getFixedMaxTicks(min: number, max: number, targetTicks: number) {
    const intervals = targetTicks - 1
    const lower = Math.abs(min)

    let neg = 0

    while (neg < intervals - 1 && neg * max / (intervals - neg) < lower)
        neg++

    const step = Math.max(max / (intervals - neg), neg === 0 ? 0 : lower / neg)

    return getTicks(-neg * step, step, targetTicks)
}

function getIntervalCounts({ min, max }: ValueRange, step: number): IntervalCounts {
    return {
        neg: min < 0 ? Math.ceil(Math.abs(min) / step) : 0,
        pos: max > 0 ? Math.ceil(max / step) : 0
    }
}

function getNiceStep(range: ValueRange, intervals: number) {
    const rawStep = (range.max - range.min) / intervals
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
    const normalizedStep = rawStep / magnitude

    const isFit = (step: number) => {
        const { neg, pos } = getIntervalCounts(range, step)

        return neg + pos <= intervals
    }

    const niceStep = NICE_STEPS.find(nice => nice >= normalizedStep && isFit(nice * magnitude)) ?? 10

    return niceStep * magnitude
}

function getStepCounts(range: ValueRange, step: number): IntervalCounts {
    const { neg, pos } = getIntervalCounts(range, step)

    return { neg, pos: range.max > 0 ? Math.max(pos, 1) : pos }
}

function distributeRemaining(range: ValueRange, step: number, counts: IntervalCounts, remaining: number) {
    if (range.min === 0)
        return { ...counts, pos: counts.pos + remaining }

    if (range.max === 0)
        return { ...counts, neg: counts.neg + remaining }

    let { neg, pos } = counts

    for (let i = 0; i < remaining; i++) {
        const negDeficit = neg * step - Math.abs(range.min)
        const posDeficit = pos * step - range.max

        if (negDeficit < posDeficit)
            neg++
        else
            pos++
    }

    return { neg, pos }
}

const NUMBER_PATTERN = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i

const GROUP_SPACES = /[\s\u00a0\u202f'\u2019_]/g

const MINUS = /^[-\u2212]/

type NumberSeparators = {
    group: string

    decimal: string
}

const separatorsByLocale = new Map<string, NumberSeparators>()

function getSeparators(locale: string) {
    let separators = separatorsByLocale.get(locale)

    if (!separators) {
        const parts = new Intl.NumberFormat(locale).formatToParts(1234567.5)

        separators = {
            group: parts.find(part => part.type === 'group')?.value ?? '',
            decimal: parts.find(part => part.type === 'decimal')?.value ?? '.'
        }

        separatorsByLocale.set(locale, separators)
    }

    return separators
}

function isThousandsComma(text: string) {
    const [integer, fraction] = text.split(',')

    return /^[1-9]\d{0,2}$/.test(integer) && /^\d{3}$/.test(fraction)
}

function normalizeByLocale(text: string, locale: string) {
    const { group, decimal } = getSeparators(locale)

    return text.split(group).join('').replace(decimal, '.')
}

const REPLACE_PATTERNS: Record<string, RegExp> = {
    '.': /,/g,
    ',': /\./g
}

const DEFAULT_PATTERN = /[.,]/g

function detectDecimal(text: string) {
    const lastDot = text.lastIndexOf('.')
    const lastComma = text.lastIndexOf(',')

    if (lastDot >= 0 && lastComma >= 0)
        return lastDot > lastComma ? '.' : ','

    if (lastDot < 0 && lastComma < 0)
        return null

    const separator = lastDot >= 0 ? '.' : ','
    const isSingle = text.indexOf(separator) === text.lastIndexOf(separator)
    const isGrouping = separator === ',' && isThousandsComma(text)

    return isSingle && !isGrouping ? separator : null
}

function normalizeByDetection(text: string) {
    const decimal = detectDecimal(text)
    const pattern = REPLACE_PATTERNS[decimal ?? ''] || DEFAULT_PATTERN
    const normalized = text.replace(pattern, '')

    return decimal === ',' ? normalized.replace(',', '.') : normalized
}

export function parseNumber(value: string | number | null | undefined, locale?: string): number {
    if (typeof value == 'number')
        return value

    if (value == null || value === '')
        return 0

    let text = String(value).replace(GROUP_SPACES, '')
    let sign = 1

    if (MINUS.test(text)) {
        sign = -1
        text = text.slice(1)
    } else if (text.startsWith('+')) {
        text = text.slice(1)
    }

    const normalized = locale ? normalizeByLocale(text, locale) : normalizeByDetection(text)

    return NUMBER_PATTERN.test(normalized) ? sign * Number(normalized) : NaN
}