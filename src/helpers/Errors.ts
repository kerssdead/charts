import { ErrorType } from '@/static/Enums'

export default function fail(error: ErrorType): never {
    throw new Error(error)
}

export function guard(action: () => void, onError: (error: unknown) => void) {
    try {
        action()
    } catch (error) {
        onError(error)
    }
}