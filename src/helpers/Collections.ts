export function sum<T>(values: T[], selector: (value: T) => number) {
    return values.reduce((acc, value) => acc + selector(value), 0)
}

export function maxOf<T>(values: T[], selector: (value: T) => number) {
    return values.reduce((acc, value) => Math.max(acc, selector(value)), -Infinity)
}

export function groupBy<T, K>(values: T[], selector: (value: T) => K) {
    const groups = new Map<K, T[]>()

    for (const value of values) {
        const key = selector(value)
        const group = groups.get(key)

        if (group)
            group.push(value)
        else
            groups.set(key, [value])
    }

    return groups
}

export function firstMappedValue<K, V>(keys: K[], map: Map<K, V>): V | undefined {
    for (const key of keys) {
        const value = map.get(key)

        if (value !== undefined)
            return value
    }

    return undefined
}

export function deepClone<T>(value: T): T {
    if (Array.isArray(value)) {
        const copy = new Array(value.length)

        for (let i = 0; i < value.length; i++)
            copy[i] = deepClone(value[i])

        return copy as T
    }

    if (value instanceof Date)
        return new Date(value) as T

    if (value == null || typeof value != 'object')
        return value

    const copy = Object.create(Object.getPrototypeOf(value)) as Record<string, unknown>
    const source = value as Record<string, unknown>

    for (const key of Object.keys(source))
        copy[key] = deepClone(source[key])

    return copy as T
}