import { ImageCrossOrigin } from '@/static/Enums'

const IMAGE_RETRY_DELAY = 30000

type ImageEntry = {
    image: HTMLImageElement | null
    failedAt: number | null
}

const images = new Map<string, ImageEntry>()

const warnedKeys = new Set<string>()

const listeners = new Set<() => void>()

export function onImageLoad(listener: () => void) {
    listeners.add(listener)

    return () => {
        listeners.delete(listener)
    }
}

export function getImage(url: string, crossOrigin = ImageCrossOrigin.Auto): HTMLImageElement | null {
    const key = `${ crossOrigin } ${ url }`
    const entry = images.get(key)

    if (entry && !canRetry(entry))
        return entry.image

    if (typeof Image != 'undefined')
        load(key, url, crossOrigin)

    return null
}

function canRetry(entry: ImageEntry) {
    return entry.failedAt != null && Date.now() - entry.failedAt >= IMAGE_RETRY_DELAY
}

function load(key: string, url: string, crossOrigin: ImageCrossOrigin) {
    const entry: ImageEntry = { image: null, failedAt: null }

    images.set(key, entry)

    const onLoad = (image: HTMLImageElement) => {
        entry.image = image

        for (const listener of listeners)
            listener()
    }
    const onError = () => {
        entry.failedAt = Date.now()

        warnOnce(key, url, crossOrigin)
    }

    const onCorsError = () => request(url, ImageCrossOrigin.None, onLoad, onError)

    if (crossOrigin == ImageCrossOrigin.Auto)
        request(url, ImageCrossOrigin.Anonymous, onLoad, onCorsError)
    else
        request(url, crossOrigin, onLoad, onError)
}

function request(
    url: string,
    crossOrigin: ImageCrossOrigin,
    onLoad: (image: HTMLImageElement) => void,
    onError: () => void
) {
    const image = new Image()

    if (crossOrigin != ImageCrossOrigin.None)
        image.crossOrigin = crossOrigin

    image.onload = () => onLoad(image)
    image.onerror = onError
    image.src = url
}

function warnOnce(key: string, url: string, crossOrigin: ImageCrossOrigin) {
    if (warnedKeys.has(key))
        return

    warnedKeys.add(key)

    if (crossOrigin == ImageCrossOrigin.Auto || crossOrigin == ImageCrossOrigin.None)
        console.warn('OCharts: image failed to load:', url)
    else
        console.warn(
            'OCharts: image failed to load:',
            url,
            '- it may lack CORS headers; ImageCrossOrigin.Auto falls back to loading without them'
        )
}