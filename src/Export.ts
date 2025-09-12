class Export {
    static asPng(canvas: HTMLCanvasElement, title: string) {
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
                if (imageData[i + j * canvas.width] & 0xff000000) {
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
                if (imageData[i + j * canvas.width] & 0xff000000) {
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

        destCtx.fillStyle = '#FFFFFF'
        destCtx.fillRect(0, 0, canvas.width, canvas.height)

        destCtx.drawImage(canvas, -leftEmpty, 0)

        let download = document.createElement(Tag.A)
        download.href = destinationCanvas.toDataURL('image/png')
        download.download = (title ?? 'chart') + '.png'
        download.click()
    }
}