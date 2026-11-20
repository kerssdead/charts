import Frames from '@/renderer/Frames'
import ChartSettings from '@/types/ChartSettings'
import Point from '@/types/Point'
import { LIGHT_THEME } from '@/Theme'

export const WINDOW = { name: 'window' }

export const SCREEN = { name: 'screen' }

export const POSITION: Point = { x: 10, y: 20 }

export const theme = { current: LIGHT_THEME }

export const RESERVED = { left: 1, top: 2, right: 3, bottom: 4 }

const pendingFrames = new Map<number, FrameRequestCallback>()

let lastFrameId = 0

export function installAnimationFrames() {
    pendingFrames.clear()

    Object.assign(globalThis, {
        requestAnimationFrame: jest.fn((callback: FrameRequestCallback) => {
            pendingFrames.set(++lastFrameId, callback)

            return lastFrameId
        }),
        cancelAnimationFrame: jest.fn((id: number) => pendingFrames.delete(id))
    })
}

export function pendingFrameCount() {
    return pendingFrames.size
}

export function runFrame(timestamp: DOMHighResTimeStamp) {
    const callbacks = [...pendingFrames.values()]

    pendingFrames.clear()

    for (const callback of callbacks)
        callback(timestamp)
}

export function createFrames(settings: Partial<ChartSettings> = {}) {
    theme.current = LIGHT_THEME

    const queue = { animate: jest.fn(() => false), render: jest.fn(() => false), version: 0 }
    const layout = { window: WINDOW, screen: SCREEN, fit: jest.fn() }
    const panels = { animate: jest.fn(() => false), list: [] }
    const input = { position: POSITION as Point | null, context: null }
    const overlay = { update: jest.fn(() => false) }
    const legend = { isMoving: false, getAnimatedReservedPaddings: jest.fn(() => RESERVED) }
    const syncTheme = jest.fn(() => false)
    const rebuildForTheme = jest.fn()
    const renewCanvas = jest.fn()
    const releaseLayers = jest.fn()
    const onError = jest.fn()

    const frames = new Frames({
        queue,
        layout,
        panels,
        input,
        getLegend: () => legend,
        getOverlays: () => [overlay],
        getSettings: () => settings as ChartSettings,
        getThemePalette: () => theme.current,
        syncTheme,
        rebuildForTheme,
        renewCanvas,
        releaseLayers,
        onError
    } as unknown as ConstructorParameters<typeof Frames>[0])

    return {
        frames,
        queue,
        layout,
        panels,
        input,
        overlay,
        legend,
        syncTheme,
        rebuildForTheme,
        renewCanvas,
        releaseLayers,
        onError
    }
}