class Renderer {
    /**
     * @type {HTMLElement}
     */
    node

    /**
     * @type {HTMLCanvasElement}
     */
    canvas

    /**
     * @type {ChartSettings}
     */
    settings

    /**
     * @type {DynSettings}
     */
    dynSettings

    /**
     * @type {CircularData}
     */
    data

    /**
     * @type {Animations}
     */
    animations

    /**
     * @param {HTMLElement} node
     * @param {ChartSettings} settings
     * @param {DynSettings} dynSettings
     */
    constructor(node, settings, dynSettings) {
        this.node = node
        this.settings = settings
        this.dynSettings = dynSettings
        this.data = settings.data
        this.animations = new Animations()
    }

    render() {
        this.canvas = document.createElement('canvas')

        this.canvas.width = 1600
        this.canvas.height = 1000

        this.node.append(this.canvas)
    }

    /**
     * @throws {Error}
     */
    destroy() {
        throw new Error('Method not implemented')
    }
}