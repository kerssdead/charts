import { getLocale, localeCached } from '@/static/Localization'

const getPercentFormats = localeCached(() => new Map<string, Intl.NumberFormat>())

export function formatPercent(ratio: number, minimumFractionDigits = 0, maximumFractionDigits = 1) {
    const formats = getPercentFormats()
    const key = `${ minimumFractionDigits }-${ maximumFractionDigits }`
    let format = formats.get(key)

    if (!format) {
        format = new Intl.NumberFormat(getLocale(), { style: 'percent', minimumFractionDigits, maximumFractionDigits })
        formats.set(key, format)
    }

    return format.format(ratio)
}