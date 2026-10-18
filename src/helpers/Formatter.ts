import { PlotAxisType } from '@/static/Enums'

abstract class Formatter {
    static number(value: number | undefined) {
        return value?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) ?? ''
    }

    static date(value: Date | undefined) {
        return value?.toLocaleDateString() ?? ''
    }

    static text(value: string | undefined) {
        return value ?? ''
    }

    static axis(value: number | Date | string, type: PlotAxisType) {
        return type == PlotAxisType.Date ? Formatter.date(new Date(value)) : value.toString()
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
                result = Formatter.date(new Date(value))
                break

            case PlotAxisType.Text:
                result = Formatter.text(value)
                break
        }

        return result + (postfix ?? '')
    }

}

export default Formatter