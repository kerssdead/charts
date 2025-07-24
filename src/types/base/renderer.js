class Renderer {
    /**
     * @type {HTMLCanvasElement}
     */
    canvas

    /**
     * @throws {Error}
     */
    render() {
        this.canvas = document.createElement('canvas')
    }

    /**
     * @throws {Error}
     */
    destroy() {
        throw new Error('Method not implemented')
    }
}