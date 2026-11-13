import { PlotAxisType } from '@/static/Enums'

const DEFAULT_DECIMALS = 2

const numberFormats = new Map<number, Intl.NumberFormat>()

const dateFormats = new Map<string, Intl.DateTimeFormat>()

export default abstract class Formatter {
    static number(value: number | undefined, decimals: number = DEFAULT_DECIMALS) {
        if (typeof value != 'number')
            return value === undefined ? '' : String(value)

        let numberFormat = numberFormats.get(decimals)

        if (!numberFormat) {
            numberFormat = new Intl.NumberFormat(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            })
            numberFormats.set(decimals, numberFormat)
        }

        return numberFormat.format(value)
    }

    static toDate(value: number | Date | string) {
        const match = typeof value == 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null

        return match ? new Date(+match[1], +match[2] - 1, +match[3]) : new Date(value)
    }

    static axis(value: number | Date | string, type: PlotAxisType) {
        return type === PlotAxisType.Date ? Formatter.formatDateTime(Formatter.toDate(value)) : value.toString()
    }

    static axisTicks(values: (number | Date | string)[], type: PlotAxisType) {
        if (type !== PlotAxisType.Date)
            return values.map(value => value.toString())

        const dates = values.map(value => Formatter.toDate(value))
        const timeFormat = getDateFormat(false, true, dates.some(hasSeconds))
        const dayFormat = getDateFormat(true, false, false)

        return dates.map(date => hasTime(date) ? timeFormat.format(date) : dayFormat.format(date))
    }

    static format(
        value: number | Date | string | undefined,
        type: PlotAxisType,
        postfix?: string | undefined,
        decimals?: number
    ) {
        let result = String(value ?? '')

        if (type === PlotAxisType.Number && !isNaN(Number(value)))
            result = Formatter.number(Number(value), decimals)
        else if (type === PlotAxisType.Date)
            result = Formatter.toDate(value ?? '').toLocaleDateString()

        return result + (postfix ?? '')
    }

    static value(value: number | Date | string | undefined, postfix?: string | undefined, decimals?: number) {
        return Formatter.format(value, PlotAxisType.Number, postfix, decimals)
    }

    private static formatDateTime(date: Date) {
        return getDateFormat(true, hasTime(date), hasSeconds(date)).format(date)
    }
}

function hasTime(date: Date) {
    return date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds() > 0
}

function hasSeconds(date: Date) {
    return date.getSeconds() > 0
}

function getDateFormat(withDay: boolean, withTime: boolean, withSeconds: boolean) {
    const key = `${ withDay }-${ withTime }-${ withSeconds }`
    let format = dateFormats.get(key)

    if (!format) {
        format = new Intl.DateTimeFormat(undefined, {
            ...(withDay ? { year: 'numeric', month: 'numeric', day: 'numeric' } : {}),
            ...(withTime
                ? { hour: 'numeric', minute: '2-digit', second: withSeconds ? '2-digit' : undefined }
                : {})
        })
        dateFormats.set(key, format)
    }

    return format
}