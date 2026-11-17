import { ThemePalette } from '@/Theme'
import { getContext, isPixelBusy } from '@/helpers/Canvas'
import { Tag } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'
import { getTableRows } from '@/charts/ChartDefinitions'
import { getTotals } from '@/export/TableTotals'
import TextResources from '@/static/TextResources'
import Size from '@/types/Size'

const PNG_MARGIN = 4

const REVOKE_DELAY = 1000

const CSV_FORMULA = /^[=+\-@\t\r]/

const escapeCsvValue = (value: unknown) => {
    let text = String(value ?? '')

    if (typeof value == 'string' && CSV_FORMULA.test(text) && isNaN(Number(text)))
        text = '\'' + text

    return '"' + text.replace(/"/g, '""') + '"'
}

type PngOptions = {
    ratio: number
    title: string
    exclude?: DOMRect
    theme: ThemePalette
    prepare?: () => void
}

const copyCanvas = (canvas: HTMLCanvasElement, { ratio, exclude, theme }: PngOptions) => {
    const source = document.createElement(Tag.Canvas)
    source.width = canvas.width
    source.height = canvas.height

    const ctx = getContext(source, true)

    ctx.drawImage(canvas, 0, 0)

    if (exclude) {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
        ctx.fillStyle = theme.canvasBackground
        ctx.fillRect(exclude.x, exclude.y, exclude.width, exclude.height)
    }

    return { source, ctx }
}

const isEmptyColumn = (pixels: Uint32Array, { width, height }: Size, background: number, x: number) => {
    for (let y = 0; y < height; y++)
        if (isPixelBusy(pixels[x + y * width], background))
            return false

    return true
}

const getEmptyEdgeWidth = (pixels: Uint32Array, size: Size, background: number) => {
    const { width } = size

    let left = 0

    while (left < width && isEmptyColumn(pixels, size, background, left))
        left++

    let right = 0

    while (right < width - left && isEmptyColumn(pixels, size, background, width - 1 - right))
        right++

    return Math.min(left, right)
}

const cropHorizontally = (source: HTMLCanvasElement, trim: number, background: string) => {
    const destination = document.createElement(Tag.Canvas)
    destination.width = source.width - trim * 2
    destination.height = source.height

    const ctx = getContext(destination)

    ctx.fillStyle = background
    ctx.fillRect(0, 0, destination.width, destination.height)

    ctx.drawImage(source, -trim, 0)

    return destination
}

export default class Export {
    static asPng(canvas: HTMLCanvasElement, options: PngOptions) {
        const { ratio, title, theme, prepare } = options

        requestAnimationFrame(() => {
            prepare?.()

            const { source, ctx } = copyCanvas(canvas, options)
            const pixels = Export.readPixels(ctx, canvas.width, canvas.height)

            if (!pixels)
                return

            const emptyWidth = getEmptyEdgeWidth(pixels, canvas, theme.canvasBackgroundInt)
            const margin = Math.round(PNG_MARGIN * ratio)
            const trim = emptyWidth > margin ? emptyWidth - margin : emptyWidth

            cropHorizontally(source, trim, theme.background).toBlob(blob => {
                if (blob)
                    Export.saveAs(
                        (title || TextResources.defaultImageName) + '.png',
                        blob,
                        { accept: { 'image/png': '.png' } }
                    )
            }, 'image/png')
        })
    }

    private static readPixels(ctx: CanvasRenderingContext2D, width: number, height: number) {
        try {
            return new Uint32Array(ctx.getImageData(0, 0, width, height).data.buffer)
        } catch (error) {
            if (!(error instanceof DOMException && error.name === 'SecurityError'))
                throw error

            console.warn('OCharts: PNG export is unavailable because an image was loaded without CORS')

            return null
        }
    }

    static asCsv(charts: ChartItem[], title: string) {
        const blocks = charts.map(chart => {
            const table = getTableRows(chart, () => false)
            const { headers, values } = table

            const headerRow = ['', ...headers.map(header => header.display)]
            const rows = values.map(row => [row.name, ...headers.map(header => row.values.get(header.value))])
            const totalsRow = ['', ...getTotals(table)]

            return [headerRow, ...rows, totalsRow]
                .map(row => row.map(escapeCsvValue).join(','))
                .join('\n')
        })

        const csv = blocks.join('\n\n')

        Export.saveAs(
            (title || TextResources.defaultTableName) + '.csv',
            new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }),
            { accept: { 'text/csv': '.csv' } }
        )
    }

    static async saveAs(name: string, blob: Blob, type: FilePickerAcceptType) {
        if (window.showSaveFilePicker !== undefined) {
            try {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: name,
                    types: [type],
                    excludeAcceptAllOption: true
                })

                const writableStream = await fileHandle.createWritable()

                await writableStream.write(blob)
                await writableStream.close()
            } catch (error) {
                if (!(error instanceof DOMException && error.name === 'AbortError'))
                    console.error(error)
            }

            return
        }

        const url = URL.createObjectURL(blob)

        const download = document.createElement(Tag.A)
        download.href = url
        download.download = name
        download.click()

        setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY)
    }
}