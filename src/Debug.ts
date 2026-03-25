export default class Debug {
    private static isEnabled: boolean = false

    static initialize(enabled: boolean) {
        Debug.isEnabled = enabled
    }

    static log(...msg: any[]) {
        if (Debug.isEnabled)
            console.log(...msg)
    }

    static warn(...msg: any[]) {
        if (Debug.isEnabled)
            console.warn(...msg)
    }

    static error(...msg: any[]) {
        if (Debug.isEnabled)
            console.error(...msg)
    }
}