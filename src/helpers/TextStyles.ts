namespace Helpers {
    export class TextStyles {
        static title(context: CanvasRenderingContext2D) {
            context.fillStyle = Theme.text
            context.textAlign = 'center'
            context.textBaseline = 'middle'
            context.font = '20px serif'
        }

        static regular(context: CanvasRenderingContext2D) {
            context.fillStyle = Theme.text
            context.textAlign = 'center'
            context.textBaseline = 'middle'
            context.font = '14px serif'
        }

        static large(context: CanvasRenderingContext2D) {
            context.fillStyle = Theme.text
            context.textAlign = 'center'
            context.textBaseline = 'middle'
            context.font = '16px serif'
        }
    }
}