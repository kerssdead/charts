class Animations {
    static transitionCurve: Map<number, number> = new Map()

    static initializeTransitions() {
        if (Animations.transitionCurve.size > 0)
            return

        const valuesCount = 22820,
            offset = .23,
            p0 = { x: 0, y: 0 },
            p1 = { x: 1 - offset, y: offset },
            p2 = { x: offset, y: 1 - offset },
            p3 = { x: 1, y: 1 }

        for (let i = 0; i < valuesCount; i++) {
            const t = (i + 1) / valuesCount

            let x = Math.pow(1 - t, 3) * p0.x
                    + 3 * Math.pow(1 - t, 2) * p1.x * t
                    + 3 * (1 - t) * Math.pow(t, 2) * p2.x
                    + Math.pow(t, 3) * p3.x,
                y = Math.pow(1 - t, 3) * p0.y
                    + 3 * Math.pow(1 - t, 2) * p1.y * t
                    + 3 * (1 - t) * Math.pow(t, 2) * p2.y
                    + Math.pow(t, 3) * p3.y

            Animations.transitionCurve.set(+x.toFixed(4), y)
        }

        Animations.transitionCurve.set(0, 0)
    }

    static getTransition(value: number): number {
        return Animations.transitionCurve.get(+value.toFixed(4)) ?? 0
    }
}

export default Animations