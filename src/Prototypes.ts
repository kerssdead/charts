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