import LegendMotion from '@/legend/LegendMotion'
import { LegendEntry } from '@/legend/LegendLayout'
import Value from '@/types/base/Value'
import ease from '@/animation/Animations'
import { AnimationTiming } from '@/static/constants/Index'

globalThis.DOMRect = class {
    constructor(public x = 0, public y = 0, public width = 0, public height = 0) {
    }
} as unknown as typeof DOMRect

const entry = (label: string, x = 0, y = 0): LegendEntry => {
    return { value: new Value({ label }), label, x, y, width: 10 }
}

const create = () => new LegendMotion(value => String(value.label))

describe('Creating legend motion', () => {
    it('Should be static until a move is requested', () => {
        const motion = create()

        expect(motion.isMoving)
            .toBe(false)
        expect(motion.isStarted)
            .toBe(false)
        expect(motion.getProgress(1000))
            .toBe(1)
        expect(motion.leaving)
            .toEqual([])
    })
})

describe('Moving legend entries', () => {
    it('Should remember previous positions and leaving entries', () => {
        const previous = [entry('a', 10, 20), entry('b', 30, 40)]
        const next = [entry('a', 50, 60)]
        const motion = create()

        motion.move(previous, { x: 0, y: 0, width: 100, height: 50 } as DOMRect, next)

        expect(motion.isMoving)
            .toBe(true)
        expect(motion.isStarted)
            .toBe(false)
        expect(motion.leaving)
            .toEqual([previous[1]])
        expect(motion.hasFrom(next[0]))
            .toBe(true)
        expect(motion.hasFrom(entry('c')))
            .toBe(false)
    })

    it('Should not start without a begin call', () => {
        const motion = create()

        motion.move([], undefined, [entry('a')])

        expect(motion.getProgress(500))
            .toBe(1)
    })

    it('Should not begin without a pending move', () => {
        const motion = create()

        motion.begin(100)

        expect(motion.isStarted)
            .toBe(false)
    })

    it('Should begin a pending move', () => {
        const motion = create()

        motion.move([], undefined, [entry('a')])
        motion.begin(100)

        expect(motion.isStarted)
            .toBe(true)
        expect(motion.isMoving)
            .toBe(true)
        expect(motion.getProgress(100))
            .toBe(0)
    })

    it('Should finish the move and reset state', () => {
        const motion = create()

        motion.move([entry('a', 10, 20)], undefined, [entry('a', 30, 40)])
        motion.begin(100)
        motion.finish()

        expect(motion.isMoving)
            .toBe(false)
        expect(motion.isStarted)
            .toBe(false)
        expect(motion.leaving)
            .toEqual([])
        expect(motion.hasFrom(entry('a')))
            .toBe(false)
        expect(motion.getArea({ x: 1, y: 2, width: 3, height: 4 } as DOMRect, .5))
            .toEqual({ x: 1, y: 2, width: 3, height: 4 })
    })
})

describe('Getting legend motion progress', () => {
    it('Should ease between the start and the end', () => {
        const motion = create()

        motion.move([], undefined, [entry('a')])
        motion.begin(0)

        expect(motion.getProgress(AnimationTiming.legend / 2))
            .toBeCloseTo(ease(.5), 3)
    })

    it('Should clamp progress to one', () => {
        const motion = create()

        motion.move([], undefined, [entry('a')])
        motion.begin(0)

        expect(motion.getProgress(AnimationTiming.legend * 2))
            .toBe(1)
    })
})

describe('Getting interpolated legend areas and entries', () => {
    it('Should interpolate the area from the previous placement', () => {
        const motion = create()
        const from = { x: 0, y: 10, width: 100, height: 40 } as DOMRect
        const to = { x: 20, y: 30, width: 120, height: 60 } as DOMRect

        motion.move([], from, [])
        motion.begin(0)

        expect(motion.getArea(to, .5))
            .toEqual(new DOMRect(10, 20, 110, 50))
    })

    it('Should return the target area when there was no previous area', () => {
        const motion = create()
        const to = { x: 20, y: 30, width: 120, height: 60 } as DOMRect

        expect(motion.getArea(to, .5))
            .toBe(to)
    })

    it('Should interpolate entry positions from previous placements', () => {
        const motion = create()

        motion.move([entry('a', 10, 20)], undefined, [entry('a', 30, 40)])
        motion.begin(0)

        expect(motion.getCurrent(entry('a', 30, 40), .5))
            .toEqual({ ...entry('a', 30, 40), x: 20, y: 30 })
    })

    it('Should return the entry itself when it had no previous placement', () => {
        const motion = create()
        const current = entry('z', 1, 2)

        expect(motion.getCurrent(current, .5))
            .toBe(current)
    })
})
