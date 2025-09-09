namespace Helpers {
    export class Errors {
        static throw(error: ErrorType): never {
            throw new Error(error)
        }
    }
}