import { Diffusion } from '@/helpers/FieldBlur'

export default interface FieldRenderData {
    columns: number
    rows: number
    values: Float32Array
    min: number
    max: number
    lut: Uint32Array
    diffusion?: Diffusion
    alive?: boolean
}