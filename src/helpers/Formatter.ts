abstract class Formatter {
    static number = (value: number | undefined) =>
        value?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) ?? ''

    static date = (value: Date) =>
        value.toLocaleDateString()
}