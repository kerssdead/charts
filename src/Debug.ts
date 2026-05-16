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

    static text(ctx: CanvasRenderingContext2D, ...msg: any[]) {
        if (Debug.isEnabled) {
            ctx.save()

            ctx.strokeStyle = 'black'

            let y = 0

            for (const line in msg) {
                ctx.fillText(msg.toString(), 0, y)

                y += 20
            }

            ctx.restore()
        }
    }
}