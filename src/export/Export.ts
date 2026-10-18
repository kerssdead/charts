import Theme from '@/Theme'
import { getContext, isPixelBusy } from '@/helpers/Canvas'
import { Tag } from '@/static/Enums'
import ChartItem from '@/types/ChartItem'
import Decomposition from '@/export/Decomposition'
import { getTotals } from '@/types/TableData'
import TextResources from '@/static/TextResources'

const PNG_MARGIN = 4

const REVOKE_DELAY = 1000

const CSV_FORMULA = /^[=+\-@\t\r]/

export default class Export {
    static asPng(canvas: HTMLCanvasElement, ratio: number, title: string, exclude?: DOMRect, isDark?: () => boolean) {
        requestAnimationFrame(() => {
            Theme.update(isDark)

            const { width, height } = canvas

            const source = document.createElement(Tag.Canvas)
            source.width = width
            source.height = height

            const ctx = getContext(source, true)

            ctx.drawImage(canvas, 0, 0)

            if (exclude) {
                ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
                ctx.fillStyle = Theme.canvasBackground
                ctx.fillRect(exclude.x, exclude.y, exclude.width, exclude.height)
            }

            const imageData = new Uint32Array(ctx.getImageData(0, 0, width, height).data.buffer)

            const isEmptyColumn = (x: number) => {
                for (let y = 0; y < height; y++)
                    if (isPixelBusy(imageData[x + y * width]))
                        return false

                return true
            }

            let leftEmpty = 0

            while (leftEmpty < width && isEmptyColumn(leftEmpty))
                leftEmpty++

            let rightEmpty = 0

            while (rightEmpty < width - leftEmpty && isEmptyColumn(width - 1 - rightEmpty))
                rightEmpty++

            let trim = Math.min(leftEmpty, rightEmpty)

            const margin = Math.round(PNG_MARGIN * ratio)

            if (trim > margin)
                trim -= margin

            const destination = document.createElement(Tag.Canvas)
            destination.width = width - trim * 2
            destination.height = height

            const destCtx = getContext(destination)

            destCtx.fillStyle = Theme.background
            destCtx.fillRect(0, 0, destination.width, destination.height)

            destCtx.drawImage(source, -trim, 0)

            destination.toBlob(blob => {
                if (blob)
                    Export.saveAs((title || TextResources.defaultImageName) + '.png', blob, { accept: { 'image/png': '.png' } })
            }, 'image/png')
        })
    }

    static asCsv(charts: ChartItem[], title: string) {
        const escape = (value: unknown) => {
            let text = String(value ?? '')

            if (typeof value == 'string' && CSV_FORMULA.test(text) && isNaN(Number(text)))
                text = '\'' + text

            return '"' + text.replace(/"/g, '""') + '"'
        }

        const blocks = charts.map(chart => {
            const table = Decomposition.getRows(chart)
            const { headers, values } = table

            const rows = values.map(row => [row.name, ...headers.map(header => Number(row.values.get(header.value) ?? 0))])

            return [['', ...headers.map(header => header.display)], ...rows, ['', ...getTotals(table)]]
                .map(row => row.map(escape).join(','))
                .join('\n')
        })

        const csv = blocks.join('\n\n')

        Export.saveAs((title || TextResources.defaultTableName) + '.csv', new Blob([csv], { type: 'text/csv;charset=utf-8' }),
            { accept: { 'text/csv': '.csv' } })
    }

    static async saveAs(name: string, blob: Blob, type: FilePickerAcceptType) {
        if (window.showSaveFilePicker != undefined) {
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
                if (!(error instanceof DOMException && error.name == 'AbortError'))
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