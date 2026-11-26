type ValueAxis = {
    readonly isHorizontal: boolean
    getAxisY(value: number): number
    getAxisValue(y: number): number
}

export default ValueAxis