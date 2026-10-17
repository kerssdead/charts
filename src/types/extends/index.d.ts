export = {}

declare global {
    interface Number {
        isAnyEquals: (...values: number[]) => boolean
    }

    interface Array {
        sumByField: (predicate: (value: any) => number) => number
    }
}