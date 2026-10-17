import Theme from 'Theme'
import Canvas from 'helpers/Canvas'
import { Tag } from 'static/Enums'

class Export {
    static asPng(canvas: HTMLCanvasElement, title: string, exclude?: DOMRect) {
        requestAnimationFrame(() => {
            const ctx = Canvas.getContext(canvas)

            if (exclude) {
                ctx.fillStyle = Theme.canvasBackground
                ctx.fillRect(exclude.x, exclude.y, exclude.width, exclude.height)
            }

            let leftEmpty = 0,
                rightEmpty = 0

            const imageData = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer)

            let isBusy = false

            for (let i = 0; i < canvas.width; i++) {
                for (let j = 0; j < canvas.height; j++) {
                    if (Canvas.isPixelBusy(imageData[i + j * canvas.width])) {
                        isBusy = true
                        break
                    }
                }

                if (isBusy)
                    break

                leftEmpty++
            }

            isBusy = false

            for (let i = canvas.width; i >= 0; i--) {
                for (let j = 0; j < canvas.height; j++) {
                    if (Canvas.isPixelBusy(imageData[i + j * canvas.width])) {
                        isBusy = true
                        break
                    }
                }

                if (isBusy)
                    break

                rightEmpty++
            }

            if (leftEmpty > 4)
                leftEmpty -= 4
            if (rightEmpty > 4)
                rightEmpty -= 4

            if (leftEmpty > rightEmpty)
                leftEmpty = rightEmpty
            if (rightEmpty > leftEmpty)
                rightEmpty = leftEmpty

            let destinationCanvas = document.createElement(Tag.Canvas)
            destinationCanvas.width = canvas.width - leftEmpty - rightEmpty
            destinationCanvas.height = canvas.height

            const destCtx = Canvas.getContext(destinationCanvas)

            destCtx.fillStyle = Theme.background
            destCtx.fillRect(0, 0, canvas.width, canvas.height)

            destCtx.drawImage(canvas, -leftEmpty, 0)

            Export.saveAs((title ?? 'chart') + '.png',
                destinationCanvas.toDataURL('image/png'))
        })
    }

    static asCsv(table: HTMLElement, title: string) {
        let rows = table.querySelectorAll('.o-table-header, .o-table-row, .o-table-footer'),
            csv = []

        for (let i = 0; i < rows.length; i++) {
            let row = [],
                cols = rows[i].querySelectorAll(':scope > div')

            for (let j = 0; j < cols.length; j++) {
                let data = (cols[j].textContent ?? '').trim()

                data = data.replace(/"/g, '""')
                row.push('"' + data + '"')
            }

            csv.push(row.join(','))
        }

        Export.saveAs((title ?? 'table') + '.csv',
            csv.join('\n'),
            'data:text/csv;charset=utf-8,' + encodeURIComponent(csv.join('\n')),
            true)
    }

    static saveAs(name: string, dataURL: string, href?: string | undefined, isText?: boolean) {
        if (window.showSaveFilePicker != undefined) {
            const accept = isText
                           ? { 'text/csv': '.csv' } as FilePickerAcceptType
                           : { 'image/*': '.png' } as FilePickerAcceptType

            const options = {
                suggestedName: name,
                types: [
                    {
                        accept: accept
                    }
                ],
                excludeAcceptAllOption: true
            } as SaveFilePickerOptions

            function toBlob(dataURI: string) {
                const byteString = atob(dataURI.split(',')[1]),
                    mimeString = dataURI.split(',')[0]
                        .split(':')[1]
                        .split(';')[0],
                    buffer = new ArrayBuffer(byteString.length),
                    imageArray = new Uint8Array(buffer)

                for (let i = 0; i < byteString.length; i++)
                    imageArray[i] = byteString.charCodeAt(i)

                return new Blob([buffer], { type: mimeString })
            }

            window.showSaveFilePicker(options)
                  .then(fileHandle => {
                      fileHandle.createWritable()
                                .then(writableStream => {
                                    writableStream.write(isText ? dataURL : toBlob(dataURL))
                                                  .then(() => writableStream.close())
                                })
                  })
        } else {
            let download = document.createElement(Tag.A)
            download.href = href ?? dataURL
            download.download = name
            download.click()
        }
    }
}

export default Export