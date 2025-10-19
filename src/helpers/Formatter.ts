import { PlotAxisType } from 'static/Enums'

export abstract class Formatter {
    static number = (value: number | undefined) =>
        value?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) ?? ''

    static date = (value: Date) =>
        value.toLocaleDateString()

    static text = (value: string | undefined) =>
        value ?? ''

    static format(value: any | undefined, type: PlotAxisType, postfix?: string | undefined) {
        let result = ''

        switch (type) {
            case PlotAxisType.Number:
                result = Formatter.number(value)
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