import ChartSettings from '@/types/ChartSettings'
import Styles from '@/static/constants/Styles'
import Size from '@/types/Size'

type HostSizeSettings = Pick<ChartSettings, 'width' | 'height'>

export function applyHostSize(element: HTMLElement, { width, height }: HostSizeSettings) {
    if (width)
        element.style.width = toCssSize(width)

    if (height)
        element.style.height = toCssSize(height)
}

export function applyFallbackHostSize(element: HTMLElement, { width, height }: HostSizeSettings) {
    if (!width && element.clientWidth === 0)
        element.style.width = Styles.Size.Full

    if (!height && element.clientHeight === 0)
        element.style.height = Styles.Size.Full

    if (!height && element.isConnected && element.clientHeight === 0)
        element.style.height = Styles.Size.FallbackHeight
}

export function getPixelSize({ width, height }: Size, ratio: number, device?: ResizeObserverSize): Size {
    const isExact = device !== undefined
                    && Math.abs(device.inlineSize - width * ratio) < 1
                    && Math.abs(device.blockSize - height * ratio) < 1

    return isExact
           ? { width: device.inlineSize, height: device.blockSize }
           : { width: Math.round(width * ratio), height: Math.round(height * ratio) }
}

function toCssSize(value: string) {
    return Number.isFinite(+value) ? `${ +value }px` : value
}