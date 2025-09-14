Number.prototype.isAnyEquals = function(...values) {
    return values.includes(<number>this)
}

Date.prototype.addDays = function(days: number) {
    let result = new Date(this)
    result.setDate(result.getDate() + days)
    return result
}