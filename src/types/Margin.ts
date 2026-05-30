export default class Margin {
    top: number = 0

    right: number = 0

    bottom: number = 0

    left: number = 0

    static x(value: number) {
        let m = new Margin()

        m.left = value
        m.right = value

        return m
    }

    static y(value: number) {
        let m = new Margin()

        m.top = value
        m.right = value

        return m
    }

    static left(value: number) {
        let m = new Margin()

        m.left = value

        return m
    }

    static right(value: number) {
        let m = new Margin()

        m.right = value

        return m
    }

    static top(value: number) {
        let m = new Margin()

        m.top = value

        return m
    }

    static bottom(value: number) {
        let m = new Margin()

        m.bottom = value

        return m
    }

    static create(top: number, right: number, bottom: number, left: number) {
        let m = new Margin()

        m.top = top
        m.right = right
        m.bottom = bottom
        m.left = left

        return m
    }

    static all(value: number) {
        let m = new Margin()

        m.top = value
        m.right = value
        m.bottom = value
        m.left = value

        return m
    }
}