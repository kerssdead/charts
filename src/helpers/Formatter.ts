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

    static format(value: any | undefined, type: PlotAxisType) {
        switch (type) {
            case PlotAxisType.Number:
                return Formatter.number(value)

            case PlotAxisType.Date:
                return Formatter.date(new Date(value))

            case PlotAxisType.Text:
                return Formatter.text(value)
        }
    }

}