abstract class Errors {
    // todo: add throwIfUndefined()
    static throw(error: ErrorType): never {
        throw new Error(error)
    }
}