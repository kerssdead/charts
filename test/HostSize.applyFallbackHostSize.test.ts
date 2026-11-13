import { applyFallbackHostSize } from '@/helpers/HostSize'
import Styles from '@/static/constants/Styles'

type HostState = { clientWidth: number, clientHeight: number, isConnected: boolean }

const apply = (
    { clientWidth, clientHeight, isConnected }: HostState,
    settings: { width?: string, height?: string } = {}
) => {
    const element = { style: {}, clientWidth, clientHeight, isConnected } as HTMLElement

    applyFallbackHostSize(element, settings)

    return { width: element.style.width, height: element.style.height }
}

describe('Applying fallback host size', () => {
    it('Should fill the parent when the element has no size', () => {
        expect(apply({ clientWidth: 0, clientHeight: 0, isConnected: false }))
            .toEqual({ width: Styles.Size.Full, height: Styles.Size.Full })
    })

    it('Should use the fallback height when filling the parent still gives no height', () => {
        expect(apply({ clientWidth: 0, clientHeight: 0, isConnected: true }).height)
            .toBe(Styles.Size.FallbackHeight)
    })

    it('Should keep the size the element already has', () => {
        expect(apply({ clientWidth: 300, clientHeight: 200, isConnected: true }))
            .toEqual({ width: undefined, height: undefined })
    })

    it('Should not override sizes set in settings', () => {
        expect(apply({ clientWidth: 0, clientHeight: 0, isConnected: true }, { width: '300', height: '200' }))
            .toEqual({ width: undefined, height: undefined })
    })
})