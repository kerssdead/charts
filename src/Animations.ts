const OFFSET = .23

const X1 = 1 - OFFSET, Y1 = OFFSET, X2 = OFFSET, Y2 = 1 - OFFSET

const EPSILON = 1e-6

const NEWTON_ITERATIONS = 8

const bezier = (t: number, p1: number, p2: number) => 3 * (1 - t) * (1 - t) * t * p1 + 3 * (1 - t) * t * t * p2 + t * t * t

const slope = (t: number, p1: number, p2: number) => 3 * (1 - t) * (1 - t) * p1 + 6 * (1 - t) * t * (p2 - p1) + 3 * t * t * (1 - p2)

class Animations {
    static getTransition(value: number): number {
        if (value <= 0)
            return 0

        if (value >= 1)
            return 1

        return bezier(Animations.solve(value), Y1, Y2)
    }

    private static solve(x: number): number {
        let t = x

        for (let i = 0; i < NEWTON_ITERATIONS; i++) {
            const error = bezier(t, X1, X2) - x

            if (Math.abs(error) < EPSILON)
                return t

            t = Math.min(Math.max(t - error / slope(t, X1, X2), 0), 1)
        }

        let low = 0, high = 1

        while (high - low > EPSILON) {
            t = (low + high) / 2

            if (bezier(t, X1, X2) < x)
                low = t
            else
                high = t
        }

        return (low + high) / 2
    }
}

export default Animations