Number.prototype.isAnyEquals = function (...values) {
    return values.includes(<number>this)
}

Date.prototype.addDays = function (days: number) {
    let result = new Date(this)
    result.setDate(result.getDate() + days)
    return result
}

Date.prototype.addMilliseconds = function (milliseconds: number) {
    let result = new Date(this)
    result.setMilliseconds(result.getMilliseconds() + milliseconds)
    return result
}

Map.prototype.trySet = function (key: any, value: any) {
    if (!this.has(key))
        this.set(key, value)
}

Array.prototype.sum = function (predicate: (value: any) => number) {
    return this.reduce((acc, v) => acc + predicate(v), 0)
}

CanvasRenderingContext2D.prototype.resetLine = function () {
    this.lineWidth = 1
    this.lineJoin = 'miter'
    this.lineCap = 'butt'
}