import { Diffusion, diffuse } from '@/helpers/FieldBlur'
import FieldRenderData from '@/types/FieldRenderData'
import { clamp, lerp, smoothstep } from '@/helpers/Geometry'

export type PointerTarget = {
    u: number
    v: number
}

type Grid = {
    columns: number
    rows: number
}

type Wave = {
    weight: number
    speed: number
    columnPhase: number
    rowPhase: number
    offset: number
}

const FRAME_MS = 33

const RAMP_SECONDS = 1.5

const MAX_TICK_SECONDS = .1

const AMPLITUDE = .25

const SIGMA_BREATH = .06

const SIGMA_SPEED = .9

const WAVES: Wave[] = [
    { weight: .6, speed: 1.1, columnPhase: .31, rowPhase: .47, offset: 0 },
    { weight: .4, speed: .7, columnPhase: -.23, rowPhase: .29, offset: 1.3 }
]

const POINTER_HEAT = .45

const POINTER_SPREAD = 1.1

const POINTER_FOLLOW = 12

const POINTER_FADE = 5

const POINTER_SNAP_HEAT = .05

const POINTER_MIN_HEAT = .001

export default class FieldLife {
    private startedAt: number | null = null

    private lastTick = 0

    private heat = 0

    private pointer: PointerTarget = { u: .5, v: .5 }

    get isActive() {
        return this.startedAt !== null
    }

    get frame() {
        return this.startedAt === null ? -1 : Math.floor(this.lastTick / FRAME_MS)
    }

    stop() {
        this.startedAt = null
        this.heat = 0
    }

    tick(now: DOMHighResTimeStamp, target: PointerTarget | null) {
        const seconds = this.startedAt === null ? 0 : clamp((now - this.lastTick) / 1000, 0, MAX_TICK_SECONDS)

        this.startedAt ??= now
        this.lastTick = now
        this.heat += ((target ? 1 : 0) - this.heat) * (1 - Math.exp(-seconds * POINTER_FADE))

        if (!target)
            return

        const follow = this.heat < POINTER_SNAP_HEAT ? 1 : 1 - Math.exp(-seconds * POINTER_FOLLOW)

        this.pointer = { u: lerp(this.pointer.u, target.u, follow), v: lerp(this.pointer.v, target.v, follow) }
    }

    getValues(field: FieldRenderData, diffusion: Diffusion) {
        const { columns, rows } = field
        const seconds = (this.lastTick - (this.startedAt ?? this.lastTick)) / 1000
        const strength = smoothstep(clamp(seconds / RAMP_SECONDS, 0, 1))

        const sources = FieldLife.getWavedSources(
            diffusion.sources,
            { columns, rows },
            seconds,
            AMPLITUDE * strength
        )
        const spread = 1 + SIGMA_BREATH * strength * Math.sin(SIGMA_SPEED * seconds)
        const values = diffuse({ ...diffusion, sources }, spread * spread, { columns, rows })

        if (this.heat > POINTER_MIN_HEAT)
            this.addPointerHeat(values, field, diffusion)

        return values
    }

    private addPointerHeat(values: Float32Array, { columns, rows, max }: FieldRenderData, diffusion: Diffusion) {
        const amount = POINTER_HEAT * max * this.heat
        const columnFalloff = FieldLife.getFalloff(columns, this.pointer.u, diffusion.sigmaX * POINTER_SPREAD)
        const rowFalloff = FieldLife.getFalloff(rows, this.pointer.v, diffusion.sigmaY * POINTER_SPREAD)

        for (let row = 0; row < rows; row++) {
            const rowAmount = amount * rowFalloff[row]

            for (let column = 0; column < columns; column++)
                values[row * columns + column] += rowAmount * columnFalloff[column]
        }
    }

    private static getFalloff(count: number, center: number, sigma: number) {
        return Float32Array.from({ length: count }, (_, index) => {
            const distance = (index + .5 - center * count) / sigma

            return Math.exp(-distance * distance / 2)
        })
    }

    private static getWavedSources(
        sources: Float32Array,
        { columns, rows }: Grid,
        seconds: number,
        amplitude: number
    ) {
        const result = new Float32Array(sources.length)
        const waves = WAVES.map(wave => ({
            weight: wave.weight * amplitude,
            column: FieldLife.getPhases(columns, wave.columnPhase, wave.speed * seconds + wave.offset),
            row: FieldLife.getPhases(rows, wave.rowPhase, 0)
        }))

        for (let row = 0; row < rows; row++)
            for (let column = 0; column < columns; column++) {
                const index = row * columns + column

                if (sources[index] === 0)
                    continue

                let wave = 0

                for (const { weight, column: across, row: down } of waves)
                    wave += weight * (across.sin[column] * down.cos[row] + across.cos[column] * down.sin[row])

                result[index] = sources[index] * (1 + wave)
            }

        return result
    }

    private static getPhases(count: number, step: number, start: number) {
        const sin = new Float64Array(count)
        const cos = new Float64Array(count)

        for (let index = 0; index < count; index++) {
            sin[index] = Math.sin(start + step * index)
            cos[index] = Math.cos(start + step * index)
        }

        return { sin, cos }
    }
}