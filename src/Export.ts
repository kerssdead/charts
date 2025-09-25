class Export {
    static asPng(canvas: HTMLCanvasElement, title: string) {
        requestAnimationFrame(() => {
            const ctx = Helpers.Canvas.getContext(canvas)

            let width = Helper.stringWidth(TextResources.exportPNG) + 16,
                height = 64

            if (width < 50)
                width = 50

            ctx.clearRect(canvas.width - width, 0, width, height)

            let leftEmpty = 0,
                rightEmpty = 0

            const imageData = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer)

            let isBusy = false

            for (let i = 0; i < canvas.width; i++) {
                for (let j = 0; j < canvas.height; j++) {
                    if (Helpers.Canvas.isPixelBusy(imageData[i + j * canvas.width])) {
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
                    if (Helpers.Canvas.isPixelBusy(imageData[i + j * canvas.width])) {
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

            const destCtx = Helpers.Canvas.getContext(destinationCanvas)

            destCtx.fillStyle = Theme.background
            destCtx.fillRect(0, 0, canvas.width, canvas.height)

            destCtx.drawImage(canvas, -leftEmpty, 0)

            Export.saveAs((title ?? 'chart') + '.png',
                destinationCanvas.toDataURL('image/png'))
        })
    }

    static asCsv(table: HTMLTableElement, title: string) {
        let rows = table.querySelectorAll('tr'),
            csv = []

        for (let i = 0; i < rows.length; i++) {
            let row = [],
                cols = rows[i].querySelectorAll('td, th')

            for (let j = 0; j < cols.length; j++) {
                let data = cols[j].innerHTML
                    .replace(/(\r\n|\n|\r)/gm, '')
                    .replace(/(\s\s)/gm, ' ')

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