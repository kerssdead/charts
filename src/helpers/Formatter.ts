import { PlotAxisType } from '@/static/Enums'

let numberFormat: Intl.NumberFormat | undefined

abstract class Formatter {
    static number(value: number | undefined) {
        if (typeof value != 'number')
            return value == undefined ? '' : String(value)

        numberFormat ??= new Intl.NumberFormat(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })

        return numberFormat.format(value)
    }

    static date(value: Date | undefined) {
        return value?.toLocaleDateString() ?? ''
    }

    static toDate(value: number | Date | string) {
        const match = typeof value == 'string' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null

        return match ? new Date(+match[1], +match[2] - 1, +match[3]) : new Date(value)
    }

    static text(value: string | undefined) {
        return value ?? ''
    }

    static axis(value: number | Date | string, type: PlotAxisType) {
        return type == PlotAxisType.Date ? Formatter.date(Formatter.toDate(value)) : value.toString()
    }

    static format(value: any | undefined, type: PlotAxisType, postfix?: string | undefined) {
        let result = value

        switch (type) {
            case PlotAxisType.Number:
                if (isNaN(+value))
                    result = Formatter.text(value)
                else
                    result = Formatter.number(+value)
                break

            case PlotAxisType.Date:
                result = Formatter.date(Formatter.toDate(value))
                break

            case PlotAxisType.Text:
                result = Formatter.text(value)
                break
        }

        return result + (postfix ?? '')
    }

    static value(value: any | undefined, postfix?: string | undefined) {
        return Formatter.format(value, PlotAxisType.Number, postfix)
    }

}

export default Formatter