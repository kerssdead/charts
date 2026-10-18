import { ErrorType } from '@/static/Enums'

export function fail(error: ErrorType): never {
    throw new Error(error)
}