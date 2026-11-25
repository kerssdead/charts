import { clamp } from '@/helpers/Geometry'

const FEATHER = .3

const ALPHA_BYTE = 3

const BYTES_PER_COLOR = 4

export default class FieldReveal {
    private arrivals = new Float32Array(0)

    private revealed: Uint32Array | null = null

    measure(levels: Uint8Array, levelCount: number) {
        const counts = new Float32Array(levelCount)

        for (const level of levels)
            counts[level]++

        this.arrivals = new Float32Array(levelCount)

        let higher = 0

        for (let level = levelCount - 1; level >= 0; level--) {
            this.arrivals[level] = higher / levels.length
            higher += counts[level]
        }
    }

    getLut(lut: Uint32Array, progress: number) {
        if (progress >= 1)
            return lut

        const result = this.revealed ??= new Uint32Array(lut.length)
        const bytes = new Uint8ClampedArray(result.buffer)

        result.set(lut)

        for (let level = 0; level < lut.length; level++) {
            const visible = clamp((progress * (1 + FEATHER) - this.arrivals[level]) / FEATHER, 0, 1)

            bytes[level * BYTES_PER_COLOR + ALPHA_BYTE] *= visible
        }

        return result
    }
}