import EnumInput from '@/types/EnumInput'

let hasWarned = false

function warnNumericOnce(input: number, replacement: string | undefined) {
    if (hasWarned)
        return

    hasWarned = true

    console.warn(
        'OCharts: numeric enum values are deprecated and will be removed in 3.0.0;',
        `use '${ replacement }' instead of ${ input }`
    )
}

export function parseEnumInput<E extends string>(values: Record<string, E>, input: EnumInput<E> | undefined) {
    if (typeof input === 'number') {
        const value = Object.values(values)[input]

        warnNumericOnce(input, value)

        return value ?? input as unknown as E
    }

    return input as E | undefined
}