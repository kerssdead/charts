import { ErrorType } from '@/static/Enums'

export default function fail(error: ErrorType): never {
    throw new Error(error)
}