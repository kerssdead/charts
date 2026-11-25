export type CellLabel = {
    text: string
    color: string
}

export default interface CellsRenderData {
    columns: number
    rows: number
    colors: Uint32Array
    delays: Float32Array
    labels: (CellLabel | null)[]
    labelSize: number
}