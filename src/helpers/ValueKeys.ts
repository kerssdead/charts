import Value from '@/types/base/Value'

export function getGroupKey(value: Value, isShared: boolean) {
    return isShared ? `${ value.label }-${ value.labelIndex }` : value.id
}