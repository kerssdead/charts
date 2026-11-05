export function toScaleUnits(value: number, isLog: boolean) {
    return isLog ? Math.log10(value) : value
}

export function fromScaleUnits(units: number, isLog: boolean) {
    return isLog ? Math.pow(10, units) : units
}