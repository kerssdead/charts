export function sum<T>(values: T[], selector: (value: T) => number) {
    return values.reduce((acc, value) => acc + selector(value), 0)
}

export function maxOf<T>(values: T[], selector: (value: T) => number) {
    return values.reduce((acc, value) => Math.max(acc, selector(value)), 0)
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

export function deepClone<T>(value: T): T {
    if (Array.isArray(value))
        return value.map(deepClone) as T

    if (value instanceof Date)
        return new Date(value) as T

    if (value === null || typeof value != 'object')
        return value

    const copy = Object.create(Object.getPrototypeOf(value))

    for (const [key, item] of Object.entries(value))
        copy[key] = deepClone(item)

    return copy
}