const CROSS_ORIGIN = 'anonymous'

const images = new Map<string, HTMLImageElement | null>()

const listeners = new Set<() => void>()

export function onImageLoad(listener: () => void) {
    listeners.add(listener)

    return () => {
        listeners.delete(listener)
    }
}

export function getImage(url: string): HTMLImageElement | null {
    if (images.has(url))
        return images.get(url) ?? null

    images.set(url, null)

    if (typeof Image == 'undefined')
        return null

    const image = new Image()

    image.crossOrigin = CROSS_ORIGIN
    image.onload = () => {
        images.set(url, image)

        for (const listener of listeners)
            listener()
    }
    image.src = url

    return null
}
