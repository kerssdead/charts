import ChartSettings from '@/types/ChartSettings'

export const rendererCalls: string[] = []

export const rendererSettings: ChartSettings[] = []

export const rendererErrorHandlers: ((error: unknown) => void)[] = []

export const rendererFailures: { apply?: Error, destroy?: Error } = {}

export const mockRendererModule = {
    __esModule: true,
    default: class {
        constructor(_canvas: unknown, _viewState: unknown, _theme: unknown, onError: (error: unknown) => void) {
            rendererErrorHandlers.push(onError)
        }

        apply(settings: ChartSettings) {
            rendererCalls.push('apply')
            rendererSettings.push(settings)

            if (rendererFailures.apply)
                throw rendererFailures.apply
        }

        destroy() {
            rendererCalls.push('destroy')

            if (rendererFailures.destroy)
                throw rendererFailures.destroy
        }

        suspend() {
            rendererCalls.push('suspend')
        }

        resume() {
            rendererCalls.push('resume')
        }

        render() {
            rendererCalls.push('render')
        }

        resize() {
            rendererCalls.push('resize')
        }
    }
}