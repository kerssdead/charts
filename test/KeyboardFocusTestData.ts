import KeyboardFocus from '@/renderer/KeyboardFocus'
import Queue from '@/render/Queue'
import RenderItem from '@/types/RenderItem'
import { ItemFlag as f } from '@/static/ItemFlag'

export type FakeStop = {
    focusOrder: number | null
    focusPoint: { x: number, y: number } | null
    focusBounds: { left: number, top: number, right: number, bottom: number } | null
    onClick: jest.Mock
    panel: unknown
    is: (flag: f) => boolean
}

export const stop = (overrides: Partial<FakeStop> & { flags?: number } = {}): FakeStop => {
    const { flags = 0, ...rest } = overrides

    return {
        focusOrder: 0,
        focusPoint: { x: 1, y: 2 },
        focusBounds: null,
        onClick: jest.fn(),
        panel: null,
        is: (flag: f) => (flags & flag) !== 0,
        ...rest
    }
}

export const createFocus = (items: FakeStop[]) => {
    const queue = { items, version: 1 }
    const onChange = jest.fn()

    return { focus: new KeyboardFocus(queue as unknown as Queue, onChange), queue, onChange }
}

export const key = (name: string, fields: Partial<KeyboardEvent> = {}) => {
    return { key: name, ...fields } as KeyboardEvent
}

export type { RenderItem }