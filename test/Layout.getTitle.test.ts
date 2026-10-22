import Layout from '@/renderer/Layout'
import MenuButton from '@/renderer/MenuButton'
import QueueItemsBuilder from '@/builders/QueueItemsBuilder'

jest.mock('@/helpers/Text', () => ({ stringWidth: (text: string, font: number = 14) => text.length * font / 2 }))

function getTitle(title: string, width: number, menuLeft?: number) {
    const layout = new Layout()

    layout.width = width
    layout.height = 300

    const menu = menuLeft == undefined ? undefined : { resize: () => {}, bounds: { left: menuLeft } } as unknown as MenuButton

    layout.update(title, undefined, menu)

    const result = { text: '', font: 0 }

    const items = new Proxy({}, {
        get: (_, name) => (value: string | number) => {
            if (name == 'text')
                result.text = value as string

            if (name == 'size')
                result.font = value as number

            return items
        }
    }) as QueueItemsBuilder

    layout.getTitle()(items)

    return result
}

describe('Getting chart title', () => {
    it('Should keep short title with default font', () => {
        expect(getTitle('Title', 800, 764))
            .toEqual({ text: 'Title', font: 20 })
    })

    it('Should shrink font to fit title', () => {
        expect(getTitle('A'.repeat(80), 800, 764))
            .toEqual({ text: 'A'.repeat(80), font: 18.2 })
    })

    it('Should truncate title with min font when it does not fit', () => {
        const { text, font } = getTitle('A'.repeat(200), 800, 764)

        expect(font)
            .toBe(14)
        expect(text)
            .toBe('A'.repeat(103) + '…')
    })

    it('Should keep title away from menu button on both sides', () => {
        expect(getTitle('A'.repeat(40), 300, 264).text)
            .toBe('A'.repeat(31) + '…')
    })

    it('Should use title padding when menu is disabled', () => {
        expect(getTitle('A'.repeat(40), 300).text)
            .toBe('A'.repeat(38) + '…')
    })
})