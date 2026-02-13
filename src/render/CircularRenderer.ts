import Renderer from 'types/base/Renderer'
import CircularData from 'types/data/CircularData'
import Sector from 'types/Sector'
import CircularAngle from 'types/CircularAngle'
import Point from 'types/Point'
import DropdownItem from 'types/DropdownItem'
import * as Helper from 'Helper'
import Dropdown from 'Dropdown'
import Theme from 'Theme'
import TextStyles from 'helpers/TextStyles'
import Chart from 'Chart'
import TooltipValue from 'types/TooltipValue'
import Decomposition from 'Decomposition'
import Export from 'Export'
import TextResources from 'static/TextResources'
import Modal from 'Modal'
import Canvas from 'helpers/Canvas'
import Formatter from 'helpers/Formatter'
import { AnimationType, DrawPointType, Events, Icon, PlotAxisType } from 'static/Enums'
import * as Constants from 'static/constants/Index'
import Styles from 'static/constants/Styles'
import DrawPoint from 'types/DrawPoint'

class CircularRenderer extends Renderer<CircularData> {
    private readonly startAngle: number

    private isMousePositionChanged: boolean

    private isInsideCircle: boolean

    private canRenderInnerTitle: boolean

    private isDonut: boolean

    private radius: number

    private pinned: string[]

    private hover: string[]

    private prevMousePos: Point

    private center: Point

    private angles: CircularAngle[]

    private other: Sector[]

    private innerTitleStyle: Function

    constructor(chart: Chart) {
        super(chart)

        this.startAngle = Math.PI / 4
        this.isMousePositionChanged = false
        this.prevMousePos = new Point()

        this.moveEvent = new MouseEvent(Events.MouseMove)
    }

    private calculateAngles() {
        const valuesSum = this.data.values.sum(v => v.current)

        let anglesSum = this.startAngle
        this.angles = this.data.values.flatMap(sector => {
                              const angle = sector.current / valuesSum * 2 * Math.PI

                              return {
                                  id: sector.id,
                                  value: angle,
                                  sum: (anglesSum += angle) - angle
                              }
                          })
                          .reverse()
    }

    private getAngle(sector: Sector) {
        return this.angles.find(o => o.id == sector.id)?.value ?? 0
    }

    private getAccumulator(sector: Sector) {
        return this.angles.find(o => o.id == sector.id)?.sum ?? this.startAngle
    }

    private calculatePoint(sector: Sector): Sector {
        let accumulator = this.getAccumulator(sector)

        const getPoint = (radius: number, angle: number, center: Point): Point => {
            return {
                x: center.x + radius * Math.cos(accumulator + angle),
                y: center.y + radius * Math.sin(accumulator + angle)
            }
        }

        const startPoint = getPoint(this.radius, 0, this.center)
        const angle = this.getAngle(sector)

        let nextPoint = getPoint(this.radius, angle, this.center)
        let points: DrawPoint[] = []

        sector.direction = accumulator + angle / 2

        if (angle > 0) {
            if (sector.current > 0) {
                let labelStartPoint = getPoint(this.radius + 10, angle / 2, this.center),
                    labelMidPoint = getPoint(this.radius + 20, angle / 2, this.center)

                const dir = labelStartPoint.x > this.center.x ? 1 : -1

                let endPoint = {
                    x: labelMidPoint.x + 10 * dir,
                    y: labelMidPoint.y
                }

                sector.labelPoints = [
                    new DrawPoint(DrawPointType.Move, labelStartPoint.x, labelStartPoint.y),
                    new DrawPoint(DrawPointType.QuadraticCurve, labelMidPoint.x, labelMidPoint.y, endPoint.x, endPoint.y)
                ]
            }

            if (!this.isDonut)
                points.push(new DrawPoint(DrawPointType.Move, this.center.x, this.center.y))

            points.push(new DrawPoint(DrawPointType.Move, startPoint.x, startPoint.y))

            let localAccumulator = 0,
                localAngle = angle

            while (localAngle > 0) {
                let currentAngle = localAngle - Math.PI / 2 > 0
                                   ? Math.PI / 2
                                   : localAngle

                nextPoint = getPoint(this.radius, localAccumulator + currentAngle, this.center)

                const p1Angle = Math.PI - currentAngle,
                    p1Length = this.radius / Math.sin(p1Angle / 2),
                    p1 = getPoint(p1Length, localAccumulator + currentAngle / 2, this.center)

                points.push(new DrawPoint(DrawPointType.ArcTo, p1.x, p1.y, nextPoint.x, nextPoint.y, this.radius))

                localAccumulator += currentAngle

                if (this.data.values.length == 1)
                    accumulator += localAccumulator

                localAngle -= Math.PI / 2
            }

            if (this.isDonut || sector.innerRadius != 0) {
                const innerRadius = this.radius * (sector.innerRadius / 100)

                const innerPoint2 = {
                    x: nextPoint.x - (((this.radius - innerRadius) * (nextPoint.x - this.center.x)) / this.radius),
                    y: nextPoint.y - (((this.radius - innerRadius) * (nextPoint.y - this.center.y)) / this.radius)
                }

                points.push(new DrawPoint(DrawPointType.Line, innerPoint2.x, innerPoint2.y))

                localAngle = 0
                localAccumulator = angle

                while (localAngle < angle) {
                    let currentAngle = localAngle + Math.PI / 2 < angle
                                       ? Math.PI / 2
                                       : angle - localAngle

                    nextPoint = getPoint(innerRadius, localAccumulator - currentAngle, this.center)

                    const p1Angle = Math.PI - currentAngle,
                        p1Length = innerRadius / Math.sin(p1Angle / 2),
                        p1 = getPoint(p1Length, localAccumulator - currentAngle / 2, this.center)

                    points.push(new DrawPoint(DrawPointType.ArcTo, p1.x, p1.y, nextPoint.x, nextPoint.y, innerRadius))

                    localAccumulator -= currentAngle

                    localAngle += Math.PI / 2
                }
            } else {
                points.push(new DrawPoint(DrawPointType.Line, this.center.x, this.center.y))
            }

            accumulator += angle
        }

        if (this.data.values.length == 1)
            points = [
                new DrawPoint(DrawPointType.SemiCircle, this.center.x, this.center.y, this.radius, 0, Math.PI * 2)
            ]

        sector.points = points

        return sector
    }

    private scale(sector: Sector, value: number, transition: number) {
        const centerOfSector = {
            x: this.center.x + this.radius / 2 * Math.cos(sector.direction),
            y: this.center.y + this.radius / 2 * Math.sin(sector.direction)
        }

        const setArgs = (points: DrawPoint[]) => {
            for (let p of points ?? []) {
                if (p.type == DrawPointType.SemiCircle) {
                    p.args[2] = p.base[2] * value + p.base[2] * (1 - value) * transition

                    continue
                }

                for (let i = 0; i < p.args.length; i += 2) {
                    const x = p.base[i],
                        y = p.base[i + 1],
                        length = Math.sqrt(Math.pow(x - centerOfSector.x, 2) + Math.pow(y - centerOfSector.y, 2)),
                        computed = length * value + length * (1 - value) * transition,
                        ratio = computed / length

                    const xx = ratio * x + (1 - ratio) * centerOfSector.x,
                        yy = ratio * y + (1 - ratio) * centerOfSector.y

                    if (!isNaN(xx) && !isNaN(yy)) {
                        p.args[i] = xx
                        p.args[i + 1] = yy
                    } else {
                        p.args[i] = p.base[i] * value + p.base[i] * (1 - value) * transition
                        p.args[i + 1] = p.base[i + 1] * value + p.base[i + 1] * (1 - value) * transition
                    }
                }
            }
        }

        setArgs(sector.points)
        setArgs(sector.labelPoints)
    }

    private focus(sector: Sector, value: number, transition: number) {
        sector.color = Helper.applyAlpha(sector.baseColor, 255 - 255 * value * transition)
        sector.textColor = Helper.applyAlpha(Theme.text, 255 - 255 * value * transition)
    }

    private translate(sector: Sector, value: number, transition: number) {
        const offset = {
            x: (this.center.x + this.radius * Math.cos(sector.direction) - this.center.x) * value,
            y: (this.center.y + this.radius * Math.sin(sector.direction) - this.center.y) * value
        }

        sector.translate = {
            x: offset.x * transition,
            y: offset.y * transition
        }

        const setArgs = (points: DrawPoint[]) => {
            for (let p of points ?? []) {
                switch (p.type) {
                    case DrawPointType.SemiCircle:
                        p.args[0] = p.base[0] + sector.translate.x
                        p.args[1] = p.base[1] + sector.translate.y

                        break

                    case DrawPointType.ArcTo:
                        p.args[0] = p.base[0] + sector.translate.x
                        p.args[1] = p.base[1] + sector.translate.y
                        p.args[2] = p.base[2] + sector.translate.x
                        p.args[3] = p.base[3] + sector.translate.y

                        break

                    default:
                        for (let i = 0; i < p.args.length; i += 2) {
                            p.args[i] = p.base[i] + sector.translate.x
                            p.args[i + 1] = p.base[i + 1] + sector.translate.y
                        }

                        break
                }
            }
        }

        setArgs(sector.points)
        setArgs(sector.labelPoints)
    }

    private outline(sector: Sector, value: number, transition: number) {
        sector.lineStyles = transition == 0
                            ? {
                lineWidth: 1,
                lineJoin: 'miter',
                lineCap: 'butt'
            }
                            : {
                lineWidth: this.getAngle(sector) > Math.PI / 6
                           ? value * transition
                           : 1,
                lineJoin: 'round',
                lineCap: 'round'
            }
    }

    private canRenderLabel(sector: Sector, ctx: CanvasRenderingContext2D) {
        if (sector.state == AnimationType.None && sector.canRenderLabel != undefined)
            return sector.canRenderLabel

        if (sector.current == 0)
            return sector.canRenderLabel = false

        if (sector.state == AnimationType.None && sector.canRenderLabel)
            return sector.canRenderLabel

        const dir = sector.labelPoints[0].args[0] < sector.labelPoints[1].args[0] ? 1 : -1

        let isBusy = false

        const endPoint = {
            x: sector.labelPoints[1].args[0],
            y: sector.labelPoints[1].args[1]
        }

        const textWidth = Helper.stringWidth(sector.label),
            imageDataX = dir == 1 ? endPoint.x + 12 : endPoint.x - textWidth - 12 + (sector.translate ? sector.translate.x : 0),
            imageDataY = endPoint.y - 12 + (sector.translate ? sector.translate.y : 0),
            imageData = new Uint32Array(ctx.getImageData(imageDataX, imageDataY, textWidth, 28).data.buffer)

        if (imageDataX < 0 || imageDataX + textWidth > this.canvas.width
            || endPoint.y - 12 < 0 || endPoint.y + 12 > this.canvas.height)
            isBusy = true

        if (!isBusy)
            for (let i = 0; i < imageData.length; i++)
                if (Canvas.isPixelBusy(imageData[i])) {
                    isBusy = true
                    break
                }

        return sector.canRenderLabel = !isBusy
    }

    private drawLabel(sector: Sector, ctx: CanvasRenderingContext2D) {
        if (!this.canRenderLabel(sector, ctx))
            return

        ctx.beginPath()

        ctx.moveTo(
            sector.labelPoints[0].args[0],
            sector.labelPoints[0].args[1]
        )

        ctx.quadraticCurveTo(
            sector.labelPoints[1].args[0],
            sector.labelPoints[1].args[1],
            sector.labelPoints[1].args[2],
            sector.labelPoints[1].args[3]
        )

        ctx.strokeStyle = sector.textColor

        if (sector.current != 0 && sector.current != sector.value)
            ctx.strokeStyle = Helper.applyAlpha(sector.textColor, Math.round(255 * (sector.current / sector.value)))

        ctx.resetLine()

        ctx.stroke()

        ctx.fillStyle = sector.textColor

        if (sector.current != 0 && sector.current != sector.value)
            ctx.fillStyle = Helper.applyAlpha(sector.textColor, Math.round(255 * (sector.current / sector.value)))

        const dir = sector.labelPoints[0].args[0] < sector.labelPoints[1].args[0] ? 1 : -1

        TextStyles.circularLabel(ctx, dir == 1)
        ctx.fillText(
            sector.label,
            sector.labelPoints[1].args[0] + 16 * dir,
            sector.labelPoints[1].args[1] + 4
        )
    }

    private drawSector(sector: Sector, ctx: CanvasRenderingContext2D) {
        ctx.beginPath()

        if (sector.lineStyles) {
            ctx.lineWidth = sector.lineStyles.lineWidth
            ctx.lineJoin = sector.lineStyles.lineJoin
            ctx.lineCap = sector.lineStyles.lineCap
        } else {
            ctx.resetLine()
        }

        for (const point of sector.points) {
            switch (point.type) {
                case DrawPointType.Move:
                    ctx.moveTo(point.args[0], point.args[1])

                    break

                case DrawPointType.Line:
                    ctx.lineTo(point.args[0], point.args[1])

                    break

                case DrawPointType.QuadraticCurve:
                    ctx.quadraticCurveTo(point.args[0], point.args[1], point.args[2], point.args[3])

                    break

                case DrawPointType.ArcTo:
                    ctx.arcTo(point.args[0], point.args[1], point.args[2], point.args[3], point.args[4])

                    break

                case DrawPointType.SemiCircle:
                    ctx.arc(point.args[0], point.args[1], point.args[2], point.args[3], point.args[4], point.args[5])

                    break
            }
        }

        ctx.fillStyle = sector.color
        ctx.strokeStyle = sector.color

        ctx.closePath()

        ctx.fill()
        ctx.stroke()
    }

    private animate(sector: Sector) {
        this.animations.handle(
            sector.id,
            AnimationType.Init,
            {
                duration: Constants.Animations.circular + (this.data.values.indexOf(sector) + 1) / this.data.values.length * Constants.Animations.circular,
                continuous: true,
                before: () => sector.state == AnimationType.Init,
                body: transition => {
                    this.scale(sector, .7, transition)
                    this.focus(sector, 1, 1 - transition)

                    if (transition == 1)
                        sector.state = AnimationType.None
                }
            }
        )

        this.animations.handle(
            sector.id,
            AnimationType.Click,
            {
                duration: 0,
                before: () => sector.state == AnimationType.Click,
                body: _transition => {
                    this.translate(sector, .1, 1)
                    this.outline(sector, 8, 1)
                }
            }
        )

        this.animations.handle(
            sector.id,
            AnimationType.MouseOver,
            {
                duration: Constants.Animations.circular,
                before: () => sector.state.isAnyEquals(AnimationType.MouseOver, AnimationType.MouseLeave),
                body: transition => {
                    if (sector.color != sector.baseColor)
                        this.focus(sector, .5, transition)
                    this.translate(sector, .1, transition)
                    this.outline(sector, 8, transition)

                    if (sector.state == AnimationType.MouseLeave
                        && this.data.values.filter(s => s.state == AnimationType.MouseOver).length > 0)
                        this.animations.end(sector.id, AnimationType.AnotherItemOver)
                }
            }
        )

        this.animations.handle(
            sector.id,
            AnimationType.AnotherItemOver,
            {
                duration: Constants.Animations.circular,
                before: () => sector.state.isAnyEquals(AnimationType.AnotherItemOver, AnimationType.AnotherItemLeave),
                body: transition => {
                    this.focus(sector, .5, transition)
                }
            }
        )
    }

    private handle(sector: Sector) {
        if (sector.disabled)
            return

        if (sector.state == AnimationType.None && !this.isInsideCircle)
            return

        const isInsideSector = this.isInsideSector(this.moveEvent, sector, this.center),
            isInsideSectorClick = this.clickEvent ? this.isInsideSector(this.clickEvent, sector, this.center) : false

        if (this.moveEvent && isInsideSector)
            this.hover?.push(sector.id)

        if (this.data.values.filter(s => !s.disabled).length == 1)
            return

        if (isInsideSectorClick) {
            sector.state = AnimationType.Click

            if (this.pinned.includes(sector.id))
                this.pinned = this.pinned.filter(id => id != sector.id)
            else
                this.pinned.push(sector.id)

            this.clickEvent = undefined

            return
        } else if (this.pinned.includes(sector.id)) {
            return
        }

        if (isInsideSector) {
            sector.state = AnimationType.MouseOver

            if (this.animations.isBackward(sector.id, AnimationType.MouseOver))
                this.animations.reverse(sector.id, AnimationType.MouseOver)

            return
        }

        if (sector.state == AnimationType.MouseOver
            && !isInsideSector) {
            sector.state = AnimationType.MouseLeave

            if (!this.animations.isBackward(sector.id, AnimationType.MouseOver))
                this.animations.reverse(sector.id, AnimationType.MouseOver)

            return
        }

        if (sector.state == AnimationType.MouseLeave
            && this.animations.isEnd(sector.id, AnimationType.MouseOver)) {
            sector.state = AnimationType.None

            return
        }

        if (sector.state == AnimationType.MouseLeave)
            return

        if (this.data.values.filter(s => s.state == AnimationType.MouseOver).length > 0) {
            sector.state = AnimationType.AnotherItemOver

            if (this.animations.isBackward(sector.id, AnimationType.AnotherItemOver))
                this.animations.reverse(sector.id, AnimationType.AnotherItemOver)

            return
        }

        if (this.data.values.filter(s => s.state == AnimationType.MouseLeave).length > 0) {
            sector.state = AnimationType.AnotherItemLeave

            if (!this.animations.isBackward(sector.id, AnimationType.AnotherItemOver))
                this.animations.reverse(sector.id, AnimationType.AnotherItemOver)

            return
        }

        if (sector.state == AnimationType.AnotherItemLeave
            && this.animations.isEnd(sector.id, AnimationType.AnotherItemOver)) {
            sector.state = AnimationType.None

            return
        }
    }

    render() {
        super.render()

        const isAnyCollapsing = this.data.values.filter(s => s.value != s.current && s.current != 0)
                                    .length > 0

        this.isMousePositionChanged = this.prevMousePos.x != this.moveEvent.clientX
                                      || this.prevMousePos.y != this.moveEvent.clientY

        if (this.isMousePositionChanged) {
            const point = this.getMousePosition(this.moveEvent)
            this.isInsideCircle = this.isWithinRadius({
                x: point.x - this.center.x,
                y: point.y - this.center.y
            })
        }

        this.prevMousePos = {
            x: this.moveEvent.clientX,
            y: this.moveEvent.clientY
        }

        if (isAnyCollapsing) {
            this.calculateAngles()
            for (let sector of this.data.values)
                sector = this.calculatePoint(sector)
        }

        if (this.data.values.filter(s => !s.disabled).length == 0) {
            this.empty()

            return
        }

        this.hover = []

        const ctx = Canvas.getContext(this.canvas)

        for (const sector of this.data.values) {
            this.animate(sector)

            this.drawSector(sector, ctx)
            this.drawLabel(sector, ctx)

            if (sector.state != AnimationType.Init)
                this.handle(sector)
        }

        super.renderDropdown()

        const currentHover = this.data.values.find(v => v.id == this.hover[0]),
            isAnyHover = this.hover.length > 0

        if (isAnyHover || this.contextMenu)
            this.renderContextMenu(currentHover?.data ?? {})
        else
            this.menuEvent = undefined

        this.tooltip.render(isAnyHover && !this.dropdown?.isActive,
            this.moveEvent,
            [
                new TooltipValue(`${ currentHover?.label }: ${ Formatter.format(currentHover?.current, PlotAxisType.Number, this.settings.valuePostfix) }`)
            ],
            currentHover)

        this.innerTitle()

        this.canvas.style.cursor = isAnyHover
                                   ? Styles.Cursor.Pointer
                                   : Styles.Cursor.Default

        if (!this.isDestroy)
            requestAnimationFrame(this.render.bind(this))
    }

    private isWithinRadius(v: Point) {
        return v.x * v.x + v.y * v.y <= this.radius * this.radius
    }

    private isInsideSector(event: MouseEvent, sector: Sector, center: Point): boolean {
        if (!this.isMousePositionChanged)
            return sector.isMouseInside

        const isAngle = (point: Point) => {
            let a = Math.atan2(point.y - center.y, point.x - center.x)
            if (a < 0)
                a += Math.PI * 2
            if (a < this.startAngle)
                a = Math.PI * 2 - Math.abs(this.startAngle - a) + this.startAngle

            let index = this.angles.findIndex(o => o.id == sector.id),
                sumBefore = this.angles[index].sum

            return !(this.dropdown?.isActive ?? false)
                   && sumBefore <= a
                   && sumBefore + this.angles[index].value - a >= 0
        }

        const point = this.getMousePosition(event)

        return sector.isMouseInside = isAngle(point) && this.isInsideCircle
    }

    private empty() {
        const ctx = Canvas.getContext(this.canvas)

        ctx.beginPath()

        ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI)
        ctx.strokeStyle = Theme.text
        ctx.stroke()

        TextStyles.regular(ctx)
        ctx.fillText(TextResources.allDataIsHidden, this.center.x, this.center.y)

        requestAnimationFrame(this.render.bind(this))
    }

    private innerTitle() {
        if (this.canRenderInnerTitle) {
            const ctx = Canvas.getContext(this.canvas)

            this.innerTitleStyle(ctx)
            ctx.fillText(this.data.innerTitle, this.center.x, this.center.y)
        }
    }

    private calculateSizes() {
        const titleOffset = this.settings.title
                            ? Constants.Values.titleOffset
                            : 0

        const shortSide = this.canvas.width > this.canvas.height - titleOffset * 2
                          ? this.canvas.height - titleOffset * 2
                          : this.canvas.width

        this.center = {
            x: this.canvas.width / 2,
            y: titleOffset + this.canvas.height / 2
        }

        let longestLabel = 0

        for (const value of this.data.values) {
            const width = Helper.stringWidth(value.label)

            if (width > longestLabel)
                longestLabel = width
        }

        this.radius = shortSide / 2 - (longestLabel + 50)

        if (this.radius < shortSide / 2 - 50)
            this.radius = shortSide / 2 - 50

        if (this.radius < 0)
            this.radius = 0

        if (this.data.innerTitle != undefined && this.data.innerTitle != '') {
            this.innerTitleStyle = TextStyles.large
            this.canRenderInnerTitle = Helper.stringWidth(this.data.innerTitle, 16)
                                       < (this.data.innerRadius / 100) * this.radius * 2

            if (!this.canRenderInnerTitle) {
                this.innerTitleStyle = TextStyles.regular
                this.canRenderInnerTitle = Helper.stringWidth(this.data.innerTitle, 14)
                                           < (this.data.innerRadius / 100) * this.radius * 2
            }

            if (!this.canRenderInnerTitle)
                console.warn(`Inner title is declared, but can't be rendered`)
        }
    }

    refresh() {
        super.refresh()

        this.dropdown?.refresh()
    }

    resize() {
        super.resize()

        this.initAnimations()
        this.calculateSizes()
        this.dropdown?.resize()

        for (let sector of this.data.values) {
            sector.canRenderLabel = undefined
            sector = this.calculatePoint(sector)
        }
    }

    prepareSettings() {
        super.prepareSettings()

        this.calculateSizes()

        this.data.values = this.data.values.map(v => new Sector(v))

        if (this.settings.enableOther) {
            if (!this.settings.contextMenu)
                this.settings.contextMenu = [] as DropdownItem[]
            else
                this.settings.contextMenu.push({
                    isDivider: true
                } as DropdownItem)

            this.settings.contextMenu.push({
                text: TextResources.show,
                condition: data => data?._other,
                action: () => {
                    new Modal(Decomposition.toChart<Sector>(this.settings, this.other),
                        {
                            width: window.innerWidth * .8,
                            height: window.innerHeight * .8
                        } as DOMRect,
                        TextResources.other)
                        .open()
                }
            })
        }

        this.pinned = []

        this.isDonut = (this.data.innerRadius ?? 0) != 0

        for (let item of this.data.values) {
            item.disabled = !item.value
            item.value ??= 0
            item.current = item.value
            item.innerRadius ??= this.data.innerRadius ?? 0

            if (item.value < 0)
                console.warn(`"${ item.label }" has negative value (${ item.value }) and will not be render`)
        }

        this.data.values = this.data.values.filter(v => v.value >= 0)

        if (this.settings.enableOther && this.data.values.length > 20) {
            this.other = this.data.values.splice(20)

            const sum = this.other.sum(v => v.current)

            this.data.values = this.data.values.slice(0, 20)

            this.data.values.push(new Sector({
                value: sum,
                current: sum,
                label: TextResources.other,
                id: Helper.guid(),
                color: this.other[this.other.length - 1].color,
                innerRadius: this.data.innerRadius,
                data: {
                    _other: true
                }
            }))
        }

        this.calculateAngles()

        for (let sector of this.data.values) {
            sector = this.calculatePoint(sector)

            sector.textColor = Theme.text
            sector.state = this.settings.disableInitAnimation || this.data.values.length == 1
                           ? AnimationType.None
                           : AnimationType.Init
        }
    }

    initDropdown() {
        super.initDropdown()

        this.dropdown = new Dropdown(this.canvas,
            {
                x: -10,
                y: 10,
                icon: Icon.ThreeLines,
                items: [
                    {
                        text: TextResources.exportPNG,
                        action: () => {
                            Export.asPng(this.canvas, this.settings.title)
                        }
                    },
                    {
                        text: TextResources.exportCSV,
                        action: () => {
                            Export.asCsv(Decomposition.toTable(CircularData.getRows(this.data)), this.settings.title)
                        }
                    },
                    {
                        isDivider: true
                    } as DropdownItem,
                    {
                        text: TextResources.decomposeToTable,
                        action: () => {
                            new Modal(Decomposition.toTable(CircularData.getRows(this.data)),
                                undefined,
                                this.settings.title ?? TextResources.dataAsTable)
                                .open()
                        }
                    }
                ]
            })
    }
}

export default CircularRenderer