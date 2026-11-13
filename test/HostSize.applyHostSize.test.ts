import { applyHostSize } from '@/helpers/HostSize'

const apply = (width?: string, height?: string) => {
    const element = { style: {} } as HTMLElement

    applyHostSize(element, { width, height })

    return { width: element.style.width, height: element.style.height }
}

describe('Applying host size', () => {
    it('Should treat plain numbers as pixels', () => {
        expect(apply('300', '200'))
            .toEqual({ width: '300px', height: '200px' })
    })

    it('Should keep CSS sizes as they are', () => {
        expect(apply('50%', '10rem'))
            .toEqual({ width: '50%', height: '10rem' })
    })

    it('Should leave the size alone when it is not set', () => {
        expect(apply())
            .toEqual({ width: undefined, height: undefined })
    })
})