import { TimeUnit } from '@/static/Enums'
import { getNiceStep } from '@/helpers/AxisTicks'

type TimeStep = {
    unit: TimeUnit
    size: number
}

const DAY = 24 * 60 * 60 * 1000

const UNIT_DURATIONS = {
    [TimeUnit.Day]: DAY,
    [TimeUnit.Month]: 30.44 * DAY,
    [TimeUnit.Year]: 365.25 * DAY
}

const DAY_SIZES = [1, 2, 7, 14]

const MONTH_SIZES = [1, 2, 3, 6]

const YEAR_MULTIPLIERS = [1, 2, 5, 10]

export function getDateTicks(min: number, max: number, targetTicks: number) {
    if (max <= min)
        return [min]

    const step = getTimeStep((max - min) / Math.max(targetTicks - 1, 1))
    const ticks: number[] = []

    for (let tick = getFirstTick(min, step); tick.getTime() <= max; tick = addStep(tick, step))
        ticks.push(tick.getTime())

    return ticks
}

function getTimeStep(rawDuration: number): TimeStep {
    const steps = [
        ...DAY_SIZES.map(size => ({ unit: TimeUnit.Day, size })),
        ...MONTH_SIZES.map(size => ({ unit: TimeUnit.Month, size }))
    ]

    const rawYears = rawDuration / UNIT_DURATIONS[TimeUnit.Year]

    return steps.find(step => step.size * UNIT_DURATIONS[step.unit] >= rawDuration)
           ?? { unit: TimeUnit.Year, size: Math.max(1, getNiceStep(rawYears, YEAR_MULTIPLIERS)) }
}

function getFirstTick(min: number, step: TimeStep) {
    const date = new Date(min)

    switch (step.unit) {
        case TimeUnit.Day:
            return advanceIfBefore(
                min,
                new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                { unit: TimeUnit.Day, size: 1 }
            )

        case TimeUnit.Month: {
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
            const offset = (step.size - monthStart.getMonth() % step.size) % step.size

            return advanceIfBefore(min, new Date(monthStart.getFullYear(), monthStart.getMonth() + offset, 1), step)
        }

        case TimeUnit.Year: {
            const year = Math.ceil(date.getFullYear() / step.size) * step.size

            return advanceIfBefore(min, new Date(year, 0, 1), step)
        }
    }
}

function advanceIfBefore(min: number, candidate: Date, step: TimeStep) {
    return candidate.getTime() < min ? addStep(candidate, step) : candidate
}

function addStep(date: Date, step: TimeStep) {
    switch (step.unit) {
        case TimeUnit.Day:
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + step.size)

        case TimeUnit.Month:
            return new Date(date.getFullYear(), date.getMonth() + step.size, 1)

        case TimeUnit.Year:
            return new Date(date.getFullYear() + step.size, 0, 1)
    }
}