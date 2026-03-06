export = {}

declare global {
    interface Number {
        isAnyEquals: (...values: number[]) => boolean
    }

    interface NumberConstructor {
        divide: (a: number, b: number) => number
    }

    interface Map<K, V> {
        trySet: (key: K, value: V) => void
    }

    interface Array {
        sumByField: (predicate: (value: any) => number) => number
    }

    interface Date {
        addDays: (days: number) => Date

        addMilliseconds: (seconds: number) => Date
    }

    interface CanvasRenderingContext2D {
        resetLine: () => void
    }
}