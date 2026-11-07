import { TimeUnit } from '@/static/Enums'
import { getNiceStep } from '@/helpers/AxisTicks'

type TimeStep = {
    unit: TimeUnit
    size: number
}

const SECOND = 1000

const MINUTE = 60 * SECOND

const HOUR = 60 * MINUTE

const DAY = 24 * HOUR

const UNIT_DURATIONS = {
    [TimeUnit.Second]: SECOND,
    [TimeUnit.Minute]: MINUTE,
    [TimeUnit.Hour]: HOUR,
    [TimeUnit.Day]: DAY,
    [TimeUnit.Month]: 30.44 * DAY,
    [TimeUnit.Year]: 365.25 * DAY
}

const SECOND_SIZES = [1, 5, 15, 30]

const MINUTE_SIZES = [1, 5, 15, 30]

const HOUR_SIZES = [1, 3, 6, 12]

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
        ...SECOND_SIZES.map(size => ({ unit: TimeUnit.Second, size })),
        ...MINUTE_SIZES.map(size => ({ unit: TimeUnit.Minute, size })),
        ...HOUR_SIZES.map(size => ({ unit: TimeUnit.Hour, size })),
        ...DAY_SIZES.map(size => ({ unit: TimeUnit.Day, size })),
        ...MONTH_SIZES.map(size => ({ unit: TimeUnit.Month, size }))
    ]

    const rawYears = rawDuration / UNIT_DURATIONS[TimeUnit.Year]

    return steps.find(step => getStepDuration(step) >= rawDuration)
           ?? { unit: TimeUnit.Year, size: Math.max(1, getNiceStep(rawYears, YEAR_MULTIPLIERS)) }
}

function getFirstTick(min: number, step: TimeStep) {
    const date = new Date(min)

    switch (step.unit) {
        case TimeUnit.Second:
        case TimeUnit.Minute: {
            const duration = getStepDuration(step)
            const offset = date.getTimezoneOffset() * MINUTE

            return advanceIfBefore(min, new Date(Math.floor((min - offset) / duration) * duration + offset), step)
        }

        case TimeUnit.Hour: {
            const hour = Math.floor(date.getHours() / step.size) * step.size

            return advanceIfBefore(min, new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour), step)
        }

        case TimeUnit.Day:
            return advanceIfBefore(
                min,
                new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                { unit: TimeUnit.Day, size: 1 }
            )

        case TimeUnit.Month: {
            const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
            const offset = (step.size - monthStart.getMonth() % step.size) % step.size

            return advanceIfBefore(
                min,
                new Date(monthStart.getFullYear(), monthStart.getMonth() + offset, 1),
                step
            )
        }

        case TimeUnit.Year: {
            const year = Math.ceil(date.getFullYear() / step.size) * step.size

            return advanceIfBefore(min, new Date(year, 0, 1), step)
        }
    }
}

function getStepDuration(step: TimeStep) {
    return step.size * UNIT_DURATIONS[step.unit]
}

function advanceIfBefore(min: number, candidate: Date, step: TimeStep) {
    return candidate.getTime() < min ? addStep(candidate, step) : candidate
}

function addStep(date: Date, step: TimeStep) {
    switch (step.unit) {
        case TimeUnit.Second:
        case TimeUnit.Minute:
            return new Date(date.getTime() + getStepDuration(step))

        case TimeUnit.Hour:
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + step.size)

        case TimeUnit.Day:
            return new Date(date.getFullYear(), date.getMonth(), date.getDate() + step.size)

        case TimeUnit.Month:
            return new Date(date.getFullYear(), date.getMonth() + step.size, 1)

        case TimeUnit.Year:
            return new Date(date.getFullYear() + step.size, 0, 1)
    }
}