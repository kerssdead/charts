import { getImage, onImageLoad } from '@/helpers/Images'
import { ImageCrossOrigin } from '@/static/Enums'
import { Extent } from '@/render/heatMap/HeatMapLayout'

type Waiting = {
    crossOrigin: ImageCrossOrigin | undefined
    owners: Map<object, () => void>
}

export type ImageRequest = {
    url: string
    crossOrigin: ImageCrossOrigin | undefined
    owner: object
    onLoad: (() => void) | undefined
}

const FLUSH_DELAY = 1500

const waiting = new Map<string, Waiting>()

let stopListening: (() => void) | null = null

let flushTimer: ReturnType<typeof setTimeout> | null = null

export function getImageExtent({ url, crossOrigin, owner, onLoad }: ImageRequest): Extent | null {
    const image = getImage(url, crossOrigin)

    if (image)
        return { width: image.naturalWidth, height: image.naturalHeight }

    if (onLoad)
        wait(url, crossOrigin, owner, onLoad)

    return null
}

function wait(url: string, crossOrigin: ImageCrossOrigin | undefined, owner: object, onLoad: () => void) {
    const entry = waiting.get(url) ?? { crossOrigin, owners: new Map() }

    entry.owners.set(owner, onLoad)

    waiting.set(url, entry)

    stopListening ??= onImageLoad(check)
}

function check() {
    for (const [url, { crossOrigin }] of waiting)
        if (!getImage(url, crossOrigin)) {
            flushTimer ??= setTimeout(flush, FLUSH_DELAY)

            return
        }

    flush()
}

function flush() {
    stopListening?.()
    stopListening = null

    if (flushTimer)
        clearTimeout(flushTimer)

    flushTimer = null

    const callbacks = new Set([...waiting.values()].flatMap(entry => [...entry.owners.values()]))

    waiting.clear()

    queueMicrotask(() => callbacks.forEach(callback => callback()))
}