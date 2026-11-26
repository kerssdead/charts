import { createErrorMessage } from '@/ui/ErrorMessage'
import ChartSettings from '@/types/ChartSettings'

export default class ChartFailure {
    isActive = false

    private message?: HTMLElement

    constructor(private readonly element: HTMLElement) {
    }

    report(error: unknown, details: object, onError?: ChartSettings['onError']) {
        this.isActive = true

        console.error('OCharts failed:', error, details)

        const isHandled = ChartFailure.isHandled(error, onError)

        if (!isHandled && this.isActive) {
            this.message = createErrorMessage()
            this.element.appendChild(this.message)
        }
    }

    clear() {
        this.isActive = false

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