export default class Debug {
    private static isEnabled: boolean = false

    static initialize(enabled: boolean) {
        Debug.isEnabled = enabled
    }

    static log(...msg: any[]) {
        if (Debug.isEnabled)
            console.log('DEBUG:', ...msg)
    }

    static warn(...msg: any[]) {
        if (Debug.isEnabled)
            console.warn('WARNING:', ...msg)
    }

    static error(...msg: any[]) {
        if (Debug.isEnabled)
            console.error('ERROR:', ...msg)
    }
}