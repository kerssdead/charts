import { PlotAxisType } from '@/static/Enums'

let numberFormat: Intl.NumberFormat | undefined

export default abstract class Formatter {
    static number(value: number | undefined) {
        if (typeof value != 'number')
            return value == undefined ? '' : String(value)

        numberFormat ??= new Intl.NumberFormat(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })

        return numberFormat.format(value)
    }

    static toDate(value: number | Date | string) {
        const match = typeof value == 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null

        return match ? new Date(+match[1], +match[2] - 1, +match[3]) : new Date(value)
    }

    static axis(value: number | Date | string, type: PlotAxisType) {
        return type == PlotAxisType.Date ? Formatter.toDate(value).toLocaleDateString() : value.toString()
    }

    static format(value: number | Date | string | undefined, type: PlotAxisType, postfix?: string | undefined) {
        let result = String(value ?? '')

        if (type == PlotAxisType.Number && !isNaN(Number(value)))
            result = Formatter.number(Number(value))
        else if (type == PlotAxisType.Date)
            result = Formatter.toDate(value ?? '').toLocaleDateString()

        return result + (postfix ?? '')
    }

    static value(value: number | Date | string | undefined, postfix?: string | undefined) {
        return Formatter.format(value, PlotAxisType.Number, postfix)
    }
}