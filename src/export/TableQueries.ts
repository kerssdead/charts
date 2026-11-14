import TableValue from '@/types/TableValue'
import { SortDirection } from '@/static/Enums'

export function sortTableValues(
    values: TableValue[],
    column: string | undefined,
    direction: SortDirection
): TableValue[] {
    if (direction === SortDirection.None)
        return values

    const sign = direction === SortDirection.Ascending ? 1 : -1

    const compareNames = (a: TableValue, b: TableValue) => {
        return sign * a.name.localeCompare(b.name, undefined, { numeric: true })
    }

    const compareCells = (key: string) => (a: TableValue, b: TableValue) => {
        const first = a.values.get(key)
        const second = b.values.get(key)

        if (first === undefined || second === undefined)
            return Number(first === undefined) - Number(second === undefined)

        return sign * (first - second)
    }

    const compare = column === undefined ? compareNames : compareCells(column)

    const childrenByParent = new Map<TableValue | undefined, TableValue[]>()
    const path: TableValue[] = []

    for (const value of values) {
        const level = value.level ?? 0
        const parent = level > 0 ? path[level - 1] : undefined

        path[level] = value

        const siblings = childrenByParent.get(parent)

        if (siblings)
            siblings.push(value)
        else
            childrenByParent.set(parent, [value])
    }

    const sorted: TableValue[] = []

    const appendChildren = (parent: TableValue | undefined) => {
        for (const child of (childrenByParent.get(parent) ?? []).sort(compare)) {
            sorted.push(child)
            appendChildren(child)
        }
    }

    appendChildren(undefined)

    return sorted
}

export function getMatchingValues(values: TableValue[], query: string): Set<TableValue> {
    const search = query.trim().toLocaleLowerCase()

    if (!search)
        return new Set(values)

    const matching = new Set<TableValue>()
    const path: TableValue[] = []

    for (const value of values) {
        const level = value.level ?? 0

        path[level] = value

        if (value.name.toLocaleLowerCase().includes(search))
            for (let index = 0; index <= level; index++)
                matching.add(path[index])
    }

    return matching
}