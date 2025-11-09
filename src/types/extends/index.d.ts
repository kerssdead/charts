export = {}

declare global {
    interface Number {
        isAnyEquals: (...values: number[]) => boolean
    }

    interface Map<K, V> {
        trySet: (key: K, value: V) => void
    }

    interface Array {
        sum: (predicate: (value: any) => number) => number
    }

    interface Date {
        addDays: (days: number) => Date

        addMilliseconds: (seconds: number) => Date
    }
}