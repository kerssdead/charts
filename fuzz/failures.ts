import { ErrorType } from '../src/static/Enums'

export type FuzzIssue = { kind: string, msg: string }

const HEURISTIC_KINDS = ['textoverlap', 'textoutside']

export const NOISE = [
    'setPointerCapture',
    'user gesture',
    'User activation',
    'ResizeObserver loop',
    ErrorType.InvalidGaugeRange
]

export const isNoiseMessage = (message: string) => {
    return NOISE.some(noise => message.includes(noise))
}

export const isFailure = (issue: FuzzIssue, strict: boolean) => {
    if (isNoiseMessage(issue.msg))
        return false

    return strict || !HEURISTIC_KINDS.includes(issue.kind)
}