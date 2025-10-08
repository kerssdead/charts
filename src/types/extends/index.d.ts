export = {}

declare global {
    interface Number {
        isAnyEquals: (...values: number[]) => boolean
    }

    interface Map<K, V> {
        trySet: (key: K, value: V) => void
    }

    interface Date {
        addDays: (days: number) => Date

        addMilliseconds: (seconds: number) => Date
    }
}