import { ErrorType } from 'static/Enums'

abstract class Errors {
    static throw(error: ErrorType): never {
        throw new Error(error)
    }

    static throwIsUndefined(object: any, error: ErrorType) {
        if (object == undefined)
            Errors.throw(error)
    }
}

export default Errors