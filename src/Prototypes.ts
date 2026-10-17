Number.prototype.isAnyEquals = function (...values) {
    return values.includes(<number>this)
}

Array.prototype.sumByField = function (predicate: (value: any) => number) {
    return this.reduce((acc, v) => acc + predicate(v), 0)
}