import { createErrorMessage } from '@/ui/ErrorMessage'
import ChartSettings from '@/types/ChartSettings'

export default class ChartFailure {
    private active: boolean = false

    private message: HTMLElement | undefined

    private readonly element: HTMLElement

    constructor(element: HTMLElement) {
        this.element = element
    }

    get isActive() {
        return this.active
    }

    report(error: unknown, details: object, onError?: ChartSettings['onError']) {
        this.active = true

        console.error('OCharts failed:', error, details)

        const isHandled = ChartFailure.isHandled(error, onError)

        if (!isHandled && this.active) {
            this.message = createErrorMessage()
            this.element.appendChild(this.message)
        }
    }

    clear() {
        this.active = false

        this.message?.remove()
        this.message = undefined
    }

    private static isHandled(error: unknown, onError?: ChartSettings['onError']) {
        try {
            return onError?.(error) === true
        } catch (handlerError) {
            console.error(handlerError)

            return false
        }
    }
}