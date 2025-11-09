import Theme from 'Theme'

abstract class TextStyles {
    static title(context: CanvasRenderingContext2D) {
        context.fillStyle = Theme.text
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.font = '20px sans-serif'
    }

    static regular(context: CanvasRenderingContext2D) {
        context.fillStyle = Theme.text
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.font = '14px sans-serif'
    }

    static large(context: CanvasRenderingContext2D) {
        context.fillStyle = Theme.text
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.font = '16px sans-serif'
    }

    static tooltip(context: CanvasRenderingContext2D) {
        context.font = '14px sans-serif'
        context.textAlign = 'start'
        context.textBaseline = 'alphabetic'
    }

    static circularLabel(context: CanvasRenderingContext2D, isRight: boolean) {
        context.textAlign = isRight ? 'start' : 'end'
        context.textBaseline = 'alphabetic'
        context.font = '14px sans-serif'
    }
}

export default TextStyles