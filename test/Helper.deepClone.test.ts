import * as Helper from '@/Helper'

describe('Deep cloning', () => {
    it('Should copy nested objects and arrays', () => {
        const source = { values: [{ label: 'a', data: { id: 1 } }] }
        const copy = Helper.deepClone(source)

        copy.values[0].label = 'b'
        copy.values[0].data.id = 2

        expect(source).toStrictEqual({ values: [{ label: 'a', data: { id: 1 } }] })
    })

    it('Should keep functions by reference', () => {
        const action = () => 1
        const copy = Helper.deepClone({ action })

        expect(copy.action).toBe(action)
    })

    it('Should copy dates', () => {
        const date = new Date(2026, 0, 1)
        const copy = Helper.deepClone({ date })

        expect(copy.date).not.toBe(date)
        expect(copy.date.getTime()).toBe(date.getTime())
    })

    it('Should keep prototype', () => {
        class Item {
            value = 1
        }

        expect(Helper.deepClone(new Item())).toBeInstanceOf(Item)
    })
})