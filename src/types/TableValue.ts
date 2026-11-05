export default interface TableValue {
    name: string

    color?: string

    level?: number

    disabled?: boolean

    values: Map<string, number>
}