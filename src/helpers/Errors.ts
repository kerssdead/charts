import { ErrorType } from '@/static/Enums'

abstract class Errors {
    static throw(error: ErrorType): never {
        throw new Error(error)
    }
}

export default Errors