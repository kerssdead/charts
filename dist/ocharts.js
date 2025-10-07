/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 172:
/***/ (() => {

// extracted by mini-css-extract-plugin


/***/ }),

/***/ 832:
/***/ (function() {


class Value {
    toggle(transition) {
        if (transition == 0)
            this.disabled = !this.disabled;
    }
    checkCondition() {
        return false;
    }
    reset() {
        this.disabled = false;
    }
}
class Renderable {
    constructor(chart) {
        this.state = RenderState.Init;
        this.node = chart.node;
        this.settings = chart.settings;
        this.animations = new Animations();
        this.canvas = document.createElement(Tag.Canvas);
        this.canvas.style.imageRendering = Styles.ImageRendering.Pixelated;
        this.node.append(this.canvas);
        this.tooltip = new Tooltip(this.canvas, this.settings);
        this.initAnimations();
    }
    render() {
        const ctx = Canvas.getContext(this.canvas);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    refresh() {
        this.tooltip.refresh();
        this.state = this.settings.disableInitAnimation ? RenderState.Idle : RenderState.Init;
    }
    resetMouse() {
        this.onMouseMoveEvent = new MouseEvent(Events.MouseMove);
        this.onClickEvent = new MouseEvent(Events.Click);
        this.onContextMenuEvent = undefined;
    }
    initAnimations() {
        this.canvasPosition = this.canvas.getBoundingClientRect();
        this.canvasPosition.x += scrollX;
        this.canvasPosition.y += scrollY;
        if (this.state == RenderState.Init && !this.settings.disableInteractions) {
            this.canvas.onmousemove = event => this.onMouseMoveEvent = event;
            this.canvas.onclick = event => this.onClickEvent = event;
            this.canvas.oncontextmenu = event => {
                event.preventDefault();
                this.contextMenu = undefined;
                if (this.onContextMenuEvent)
                    this.onContextMenuEvent = undefined;
                else
                    this.onContextMenuEvent = event;
            };
            this.canvas.onmouseleave = () => this.onMouseMoveEvent = new MouseEvent(Events.MouseMove);
        }
    }
}
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Renderer_instances, _Renderer_calculateSizes;
class Renderer extends Renderable {
    constructor(chart) {
        super(chart);
        _Renderer_instances.add(this);
        this.isDestroy = false;
        this.data = this.settings.data;
        this.highlightItems = [];
        this.state = this.settings.disableInitAnimation ? RenderState.Idle : RenderState.Init;
    }
    render() {
        super.render();
        const ctx = Canvas.getContext(this.canvas);
        if (this.settings.title) {
            TextStyles.title(ctx);
            ctx.fillText(this.settings.title, this.canvas.width / 2, Constants.Values.titleOffset);
        }
    }
    destroy() {
        this.isDestroy = true;
        this.canvas.remove();
    }
    renderDropdown() {
        this.onClickEvent = this.dropdown?.render(this.onMouseMoveEvent, this.onClickEvent);
    }
    resize() {
        __classPrivateFieldGet(this, _Renderer_instances, "m", _Renderer_calculateSizes).call(this);
        this.tooltip.refresh();
        this.dropdown?.resize();
    }
    prepareSettings() {
        const domRect = this.node.parentElement.getBoundingClientRect();
        this.settings.minWidth = isNaN(+this.settings.width)
            ? 0
            : +this.settings.width;
        this.settings.minHeight = isNaN(+this.settings.height)
            ? 0
            : +this.settings.height;
        this.settings.width = this.settings.minWidth != 0 && domRect.width < this.settings.minWidth
            ? this.settings.minWidth
            : domRect.width;
        this.settings.height = this.settings.minHeight != 0 && domRect.height < this.settings.minHeight
            ? this.settings.minHeight
            : domRect.height;
        this.canvas.width = this.settings.width;
        this.canvas.height = this.settings.height;
        const baseColor = this.settings.baseColor ?? Helper.randomColor();
        let adjustStep = Math.round(100 / this.settings.data.values.length), adjustAmount = -50;
        if (adjustStep <= 1)
            adjustStep = 1;
        for (let item of this.settings.data.values) {
            item.id = Helper.guid();
            item.color ??= Helper.adjustColor(baseColor, adjustAmount += adjustStep);
            item.label ??= TextResources.NoLabel;
        }
        for (let item of this.settings.contextMenu ?? [])
            if (item.id != undefined)
                item.action = data => this.node.dispatchEvent(new CustomEvent(item.id ?? '', { detail: data }));
    }
    initDropdown() {
    }
    renderContextMenu(data) {
        if (this.dropdown?.isActive) {
            this.onContextMenuEvent = undefined;
            return false;
        }
        if (this.onContextMenuEvent != undefined && this.settings.contextMenu?.length != 0) {
            if (this.contextMenu == undefined && this.settings.contextMenu != undefined) {
                let clone = [];
                for (const item of this.settings.contextMenu)
                    if (!item.condition || item.condition(data))
                        clone.push({
                            id: item.id,
                            text: item.text,
                            isDivider: item.isDivider,
                            action: () => {
                                item.action(data);
                                this.onContextMenuEvent = undefined;
                                this.contextMenu = undefined;
                            }
                        });
                this.contextMenu = new Dropdown(this.canvas, {
                    x: this.onContextMenuEvent.x - this.canvasPosition.x,
                    y: this.onContextMenuEvent.y - this.canvasPosition.y,
                    items: clone,
                    data: data
                });
                this.contextMenu.resize();
                this.onClickEvent = undefined;
            }
            const isClick = this.onClickEvent != undefined;
            this.onClickEvent = this.contextMenu?.render(this.onMouseMoveEvent, this.onClickEvent);
            if (this.onClickEvent == undefined && isClick) {
                this.contextMenu = undefined;
                this.onContextMenuEvent = undefined;
                return true;
            }
        }
        return false;
    }
    highlight(value) {
        if (value)
            this.highlightItems = [value.id];
        else
            this.highlightItems = [];
    }
    getMousePosition(event) {
        return {
            x: event.clientX - this.canvasPosition.x + scrollX,
            y: event.clientY - this.canvasPosition.y + scrollY
        };
    }
}
_Renderer_instances = new WeakSet(), _Renderer_calculateSizes = function _Renderer_calculateSizes() {
    let domRect = this.node.getBoundingClientRect();
    this.settings.width = this.settings.minWidth && domRect.width < this.settings.minWidth
        ? this.settings.minWidth
        : domRect.width;
    this.settings.height = this.settings.minHeight && domRect.height < this.settings.minHeight
        ? this.settings.minHeight
        : domRect.height;
    this.canvas.width = this.settings.width;
    this.canvas.height = this.settings.height;
    if (this.settings.enableLegend) {
        if (this.settings.legendPlace == undefined
            || this.settings.legendPlace == LegendPlace.Top
            || this.settings.legendPlace == LegendPlace.Bottom)
            this.canvas.height -= Legend.getLegendHeight(this.settings.data.values, this.canvas.width);
        if (this.settings.legendPlace == LegendPlace.Left
            || this.settings.legendPlace == LegendPlace.Right)
            this.canvas.width -= 500;
    }
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Animations_instances, _a, _Animations_queue, _Animations_process, _Animations_getKey, _Animations_is;
class Animations {
    constructor() {
        _Animations_instances.add(this);
        _Animations_queue.set(this, void 0);
        __classPrivateFieldSet(this, _Animations_queue, new Map(), "f");
    }
    add(id, type, value) {
        const key = __classPrivateFieldGet(this, _Animations_instances, "m", _Animations_getKey).call(this, id, type);
        if (!__classPrivateFieldGet(this, _Animations_queue, "f").has(key))
            __classPrivateFieldGet(this, _Animations_queue, "f").set(key, value);
        __classPrivateFieldGet(this, _Animations_instances, "m", _Animations_process).call(this, key);
    }
    contains(id, type) {
        return __classPrivateFieldGet(this, _Animations_queue, "f").has(__classPrivateFieldGet(this, _Animations_instances, "m", _Animations_getKey).call(this, id, type));
    }
    reload(id, type) {
        if (this.contains(id, type)) {
            let item = __classPrivateFieldGet(this, _Animations_queue, "f").get(__classPrivateFieldGet(this, _Animations_instances, "m", _Animations_getKey).call(this, id, type));
            item.timer = new Date();
        }
    }
    clear() {
        __classPrivateFieldGet(this, _Animations_queue, "f").forEach((_value, key) => !__classPrivateFieldGet(this, _Animations_instances, "m", _Animations_is).call(this, key, AnimationType.Init) && __classPrivateFieldGet(this, _Animations_queue, "f").delete(key));
    }
    static initializeTransitions() {
        const valuesCount = 30000, offset = .23, p0 = { x: 0, y: 0 }, p1 = { x: 1 - offset, y: offset }, p2 = { x: offset, y: 1 - offset }, p3 = { x: 1, y: 1 };
        for (let i = 0; i < valuesCount; i++) {
            const t = (i + 1) / valuesCount;
            let x = Math.pow(1 - t, 3) * p0.x
                + 3 * Math.pow(1 - t, 2) * p1.x * t
                + 3 * (1 - t) * Math.pow(t, 2) * p2.x
                + Math.pow(t, 3) * p3.x, y = Math.pow(1 - t, 3) * p0.y
                + 3 * Math.pow(1 - t, 2) * p1.y * t
                + 3 * (1 - t) * Math.pow(t, 2) * p2.y
                + Math.pow(t, 3) * p3.y;
            _a.transitionCurve.set(+x.toFixed(4), y);
        }
        _a.transitionCurve.set(0, 0);
    }
    static getTransition(value) {
        return _a.transitionCurve.get(+value.toFixed(4)) ?? 0;
    }
}
_a = Animations, _Animations_queue = new WeakMap(), _Animations_instances = new WeakSet(), _Animations_process = function _Animations_process(key) {
    const item = __classPrivateFieldGet(this, _Animations_queue, "f").get(key), stamp = new Date(), passed = stamp.getTime() - (item.timer ?? stamp).getTime(), transition = _a.getTransition(passed > item.duration ? 1 : passed / item.duration), before = item.before ? item.before() : true;
    if (!item.timer && before)
        item.timer = stamp;
    if (before)
        item.body(item.backward ? 1 - transition : transition);
    if (transition == 1 && (!before || item.continuous))
        __classPrivateFieldGet(this, _Animations_queue, "f").delete(key);
}, _Animations_getKey = function _Animations_getKey(id, type) {
    return id + '_' + type;
}, _Animations_is = function _Animations_is(key, type) {
    return key.endsWith('_' + type);
};
Animations.transitionCurve = new Map();
var _Button_instances, _Button_canvas, _Button_options, _Button_canvasPosition, _Button_isInit, _Button_position, _Button_initAnimations, _Button_isOnButton;
class Button {
    constructor(canvas, options) {
        _Button_instances.add(this);
        _Button_canvas.set(this, void 0);
        _Button_options.set(this, void 0);
        _Button_canvasPosition.set(this, void 0);
        _Button_isInit.set(this, void 0);
        _Button_position.set(this, void 0);
        __classPrivateFieldSet(this, _Button_canvas, canvas, "f");
        __classPrivateFieldSet(this, _Button_options, options, "f");
        this.animations = new Animations();
        __classPrivateFieldGet(this, _Button_instances, "m", _Button_initAnimations).call(this);
        const width = Helper.stringWidth(__classPrivateFieldGet(this, _Button_options, "f").text) + 20, height = 24;
        __classPrivateFieldSet(this, _Button_position, {
            x: __classPrivateFieldGet(this, _Button_options, "f").x + width > __classPrivateFieldGet(this, _Button_canvas, "f").width
                ? __classPrivateFieldGet(this, _Button_canvas, "f").width - width
                : __classPrivateFieldGet(this, _Button_options, "f").x < 0
                    ? __classPrivateFieldGet(this, _Button_canvas, "f").width + __classPrivateFieldGet(this, _Button_options, "f").x - width
                    : __classPrivateFieldGet(this, _Button_options, "f").x,
            y: __classPrivateFieldGet(this, _Button_options, "f").y + height > __classPrivateFieldGet(this, _Button_canvas, "f").height
                ? __classPrivateFieldGet(this, _Button_canvas, "f").height - height
                : __classPrivateFieldGet(this, _Button_options, "f").y < 0
                    ? __classPrivateFieldGet(this, _Button_canvas, "f").height + __classPrivateFieldGet(this, _Button_options, "f").y - height
                    : __classPrivateFieldGet(this, _Button_options, "f").y,
            width: width,
            height: height
        }, "f");
    }
    render(moveEvent, clickEvent) {
        if (!__classPrivateFieldGet(this, _Button_isInit, "f"))
            __classPrivateFieldGet(this, _Button_instances, "m", _Button_initAnimations).call(this);
        const ctx = Canvas.getContext(__classPrivateFieldGet(this, _Button_canvas, "f"));
        ctx.beginPath();
        const translate = (transition, event) => {
            this.animations.reload('animation-button', event);
            ctx.fillStyle = Helper.adjustColor(Theme.background, -Math.round(transition * 40));
        };
        if (__classPrivateFieldGet(this, _Button_instances, "m", _Button_isOnButton).call(this, moveEvent)) {
            __classPrivateFieldGet(this, _Button_canvas, "f").style.cursor = Styles.Cursor.Pointer;
            if (clickEvent && __classPrivateFieldGet(this, _Button_instances, "m", _Button_isOnButton).call(this, clickEvent)) {
                __classPrivateFieldGet(this, _Button_options, "f").action();
                clickEvent = undefined;
            }
            this.animations.add('animation-button', AnimationType.MouseOver, {
                duration: 300,
                body: transition => {
                    translate(transition, AnimationType.MouseLeave);
                }
            });
        }
        else {
            this.animations.add('animation-button', AnimationType.MouseLeave, {
                timer: Constants.Dates.minDate,
                duration: 300,
                backward: true,
                body: transition => {
                    translate(transition, AnimationType.MouseOver);
                }
            });
        }
        ctx.strokeStyle = Theme.background;
        ctx.roundRect(__classPrivateFieldGet(this, _Button_position, "f").x, __classPrivateFieldGet(this, _Button_position, "f").y, __classPrivateFieldGet(this, _Button_position, "f").width, __classPrivateFieldGet(this, _Button_position, "f").height, 4);
        ctx.fill();
        TextStyles.regular(ctx);
        ctx.fillText(__classPrivateFieldGet(this, _Button_options, "f").text, __classPrivateFieldGet(this, _Button_position, "f").x + __classPrivateFieldGet(this, _Button_position, "f").width / 2, __classPrivateFieldGet(this, _Button_position, "f").y + __classPrivateFieldGet(this, _Button_position, "f").height / 2);
        __classPrivateFieldSet(this, _Button_isInit, true, "f");
        return clickEvent;
    }
    resize() {
        __classPrivateFieldGet(this, _Button_instances, "m", _Button_initAnimations).call(this);
    }
}
_Button_canvas = new WeakMap(), _Button_options = new WeakMap(), _Button_canvasPosition = new WeakMap(), _Button_isInit = new WeakMap(), _Button_position = new WeakMap(), _Button_instances = new WeakSet(), _Button_initAnimations = function _Button_initAnimations() {
    __classPrivateFieldSet(this, _Button_canvasPosition, __classPrivateFieldGet(this, _Button_canvas, "f").getBoundingClientRect(), "f");
    __classPrivateFieldGet(this, _Button_canvasPosition, "f").x += scrollX;
    __classPrivateFieldGet(this, _Button_canvasPosition, "f").y += scrollY;
}, _Button_isOnButton = function _Button_isOnButton(event) {
    if (!event)
        return false;
    let trueX = event.clientX - __classPrivateFieldGet(this, _Button_canvasPosition, "f").x + scrollX, trueY = event.clientY - __classPrivateFieldGet(this, _Button_canvasPosition, "f").y + scrollY;
    return trueX >= __classPrivateFieldGet(this, _Button_position, "f").x && trueX <= __classPrivateFieldGet(this, _Button_position, "f").x + __classPrivateFieldGet(this, _Button_position, "f").width
        && trueY >= __classPrivateFieldGet(this, _Button_position, "f").y && trueY <= __classPrivateFieldGet(this, _Button_position, "f").y + __classPrivateFieldGet(this, _Button_position, "f").height;
};
var _Chart_instances, _Chart_renderer, _Chart_legend, _Chart_observer, _Chart_prepareSettings, _Chart_refresh, _Chart_resize, _Chart_initialize, _Chart_applyStyles;
class Chart {
    constructor(context, settings) {
        _Chart_instances.add(this);
        _Chart_renderer.set(this, void 0);
        _Chart_legend.set(this, void 0);
        _Chart_observer.set(this, void 0);
        __classPrivateFieldGet(this, _Chart_instances, "m", _Chart_initialize).call(this, settings);
        this.node = context;
        this.settings = settings;
        __classPrivateFieldGet(this, _Chart_instances, "m", _Chart_applyStyles).call(this);
        __classPrivateFieldGet(this, _Chart_instances, "m", _Chart_prepareSettings).call(this);
        if (settings.enableLegend)
            __classPrivateFieldSet(this, _Chart_legend, new Legend(this), "f");
        document.addEventListener(Events.VisibilityChanged, () => __classPrivateFieldGet(this, _Chart_renderer, "f").resetMouse());
        window.addEventListener(Events.Blur, () => __classPrivateFieldGet(this, _Chart_renderer, "f").resetMouse());
    }
    render() {
        __classPrivateFieldGet(this, _Chart_renderer, "f").render();
        __classPrivateFieldGet(this, _Chart_legend, "f")?.render();
        __classPrivateFieldSet(this, _Chart_observer, new ResizeObserver(() => {
            if (__classPrivateFieldGet(this, _Chart_renderer, "f").canvas)
                __classPrivateFieldGet(this, _Chart_instances, "m", _Chart_resize).call(this);
            else
                this.destroy();
        }), "f");
        __classPrivateFieldGet(this, _Chart_observer, "f").observe(this.node);
        __classPrivateFieldGet(this, _Chart_instances, "m", _Chart_refresh).call(this);
    }
    destroy() {
        __classPrivateFieldGet(this, _Chart_renderer, "f").destroy();
        __classPrivateFieldGet(this, _Chart_legend, "f")?.destroy();
        __classPrivateFieldGet(this, _Chart_observer, "f").disconnect();
    }
    highlight(value) {
        __classPrivateFieldGet(this, _Chart_renderer, "f").highlight(value);
    }
    reset() {
        Theme.reset();
        __classPrivateFieldGet(this, _Chart_instances, "m", _Chart_initialize).call(this, this.settings);
    }
}
_Chart_renderer = new WeakMap(), _Chart_legend = new WeakMap(), _Chart_observer = new WeakMap(), _Chart_instances = new WeakSet(), _Chart_prepareSettings = function _Chart_prepareSettings() {
    this.settings.enableTooltip = !this.settings.disableInteractions && this.settings.enableTooltip;
    switch (this.settings.type) {
        case ChartType.Plot:
            __classPrivateFieldSet(this, _Chart_renderer, new PlotRenderer(this), "f");
            break;
        case ChartType.Circular:
            __classPrivateFieldSet(this, _Chart_renderer, new CircularRenderer(this), "f");
            break;
        case ChartType.Gauge:
            __classPrivateFieldSet(this, _Chart_renderer, new GaugeRenderer(this), "f");
            break;
        case ChartType.TreeMap:
            __classPrivateFieldSet(this, _Chart_renderer, new TreeRenderer(this), "f");
            break;
    }
    __classPrivateFieldGet(this, _Chart_renderer, "f").prepareSettings();
    if (!this.settings.disableInteractions) {
        __classPrivateFieldGet(this, _Chart_renderer, "f").initDropdown();
        __classPrivateFieldGet(this, _Chart_renderer, "f").initAnimations();
    }
    __classPrivateFieldGet(this, _Chart_renderer, "f").resize();
}, _Chart_refresh = function _Chart_refresh() {
    __classPrivateFieldGet(this, _Chart_renderer, "f").refresh();
    __classPrivateFieldGet(this, _Chart_legend, "f")?.refresh();
}, _Chart_resize = function _Chart_resize() {
    __classPrivateFieldGet(this, _Chart_renderer, "f").resize();
    __classPrivateFieldGet(this, _Chart_legend, "f")?.resize();
}, _Chart_initialize = function _Chart_initialize(settings) {
    Theme.initialize(() => __classPrivateFieldGet(this, _Chart_instances, "m", _Chart_resize).call(this), settings.isDarkThemeFunction);
    Animations.initializeTransitions();
}, _Chart_applyStyles = function _Chart_applyStyles() {
    this.node.style.display = Styles.Display.Flex;
    this.node.style.flexDirection = Styles.FlexDirection.Column;
    this.node.style.alignItems = Styles.AlignItems.Center;
    this.node.style.justifyContent = Styles.JustifyContent.Center;
    this.node.style.height = '100%';
};
class Decomposition {
    static toTable(values) {
        let table = document.createElement(Tag.Table);
        table.classList.add('o-table');
        let totals = new Map();
        let rows = '', headers = '';
        let valuesMap = new Map();
        for (const tableValue of values.values) {
            let allColumns = new Map();
            for (const header of values.headers)
                allColumns.set(header.value, 0);
            for (const [key, value] of tableValue.values)
                allColumns.set(key, value);
            valuesMap.set(tableValue.name, allColumns);
        }
        for (const tableHeader of values.headers)
            headers += `
                <th>
                    ${tableHeader.display}
                </th>
            `;
        for (const [key, value] of valuesMap) {
            let columns = '';
            for (const [vKey, vValue] of value) {
                columns += `
                    <td>
                        ${vValue == undefined ? '' : Formatter.number(vValue)}
                    </td>
                `;
                if (totals.has(vKey)) {
                    let totalValue = +(totals.get(vKey) ?? 0);
                    totals.set(vKey, totalValue + +vValue);
                }
                else {
                    totals.set(vKey, vValue);
                }
            }
            rows += `
                <tr>
                    <td class="o-table-label">
                        ${key}
                    </td>
                    
                    ${columns} 
                </tr>
            `;
        }
        let totalColumns = '';
        for (const [, value] of totals)
            totalColumns += `
                <td>
                    ${value == undefined ? '' : Formatter.number(value)}
                </td>
            `;
        table.innerHTML = `
            <thead>
                <tr>
                    <th></th>
                
                    ${headers}
                </tr>
            </thead>
        
            <tbody>
                ${rows}
            </tbody>
            
            <tfoot>
                <tr>
                    <td></td>
                
                    ${totalColumns}
                </tr>
            </tfoot>
        `;
        return table;
    }
    static toChart(settings, values) {
        let container = document.createElement(Tag.Div), div = document.createElement(Tag.Div), script = document.createElement(Tag.Script), id = Helper.guid();
        container.style.display = Styles.Display.Flex;
        container.style.height = '100%';
        div.id = id;
        div.style.flexGrow = '1';
        let cloneSettings = JSON.parse(JSON.stringify(settings));
        if (cloneSettings.title)
            cloneSettings.title = cloneSettings.title + ' (Other)';
        cloneSettings.data.values = values;
        cloneSettings.minWidth = undefined;
        cloneSettings.minHeight = undefined;
        script.innerHTML = `
            new OCharts.chart(document.getElementById('${id}'), ${JSON.stringify(cloneSettings)})
                .render()
        `;
        container.append(div, script);
        return container;
    }
}
var _Dropdown_instances, _Dropdown_canvas, _Dropdown_options, _Dropdown_canvasPosition, _Dropdown_isInit, _Dropdown_position, _Dropdown_isOnlyMenu, _Dropdown_initAnimations, _Dropdown_isOnButton, _Dropdown_calculatePosition;
class Dropdown {
    constructor(canvas, options) {
        _Dropdown_instances.add(this);
        _Dropdown_canvas.set(this, void 0);
        _Dropdown_options.set(this, void 0);
        _Dropdown_canvasPosition.set(this, void 0);
        this.isActive = false;
        _Dropdown_isInit.set(this, void 0);
        _Dropdown_position.set(this, void 0);
        _Dropdown_isOnlyMenu.set(this, void 0);
        __classPrivateFieldSet(this, _Dropdown_canvas, canvas, "f");
        __classPrivateFieldSet(this, _Dropdown_options, options, "f");
        __classPrivateFieldSet(this, _Dropdown_isOnlyMenu, __classPrivateFieldGet(this, _Dropdown_options, "f").text == undefined, "f");
        this.animations = new Animations();
    }
    render(moveEvent, clickEvent) {
        if (!__classPrivateFieldGet(this, _Dropdown_isInit, "f"))
            __classPrivateFieldGet(this, _Dropdown_instances, "m", _Dropdown_initAnimations).call(this);
        if (__classPrivateFieldGet(this, _Dropdown_isOnlyMenu, "f"))
            this.isActive = true;
        const ctx = Canvas.getContext(__classPrivateFieldGet(this, _Dropdown_canvas, "f"));
        let x = __classPrivateFieldGet(this, _Dropdown_position, "f").x, y = __classPrivateFieldGet(this, _Dropdown_position, "f").y, width = __classPrivateFieldGet(this, _Dropdown_position, "f").width, height = __classPrivateFieldGet(this, _Dropdown_position, "f").height;
        ctx.beginPath();
        if (!__classPrivateFieldGet(this, _Dropdown_isOnlyMenu, "f")) {
            const translate = (transition, event) => {
                this.animations.reload('animation-dropdown', event);
                ctx.fillStyle = Helper.adjustColor(Theme.background, -Math.round(40 * transition));
            };
            if (__classPrivateFieldGet(this, _Dropdown_instances, "m", _Dropdown_isOnButton).call(this, moveEvent, x, y, width, height)) {
                __classPrivateFieldGet(this, _Dropdown_canvas, "f").style.cursor = Styles.Cursor.Pointer;
                if (clickEvent && moveEvent.x == clickEvent.x && moveEvent.y == clickEvent.y) {
                    this.isActive = !this.isActive;
                    clickEvent = undefined;
                }
                if (!this.isActive)
                    this.animations.add('animation-dropdown', AnimationType.MouseOver, {
                        duration: 300,
                        body: transition => {
                            translate(transition, AnimationType.MouseLeave);
                        }
                    });
                else
                    ctx.fillStyle = Helper.adjustColor(Theme.background, -40);
            }
            else {
                __classPrivateFieldGet(this, _Dropdown_canvas, "f").style.cursor = Styles.Cursor.Default;
                if (!this.isActive)
                    this.animations.add('animation-dropdown', AnimationType.MouseLeave, {
                        timer: Constants.Dates.minDate,
                        duration: 300,
                        backward: true,
                        body: transition => {
                            translate(transition, AnimationType.MouseOver);
                        }
                    });
                else
                    ctx.fillStyle = Helper.adjustColor(Theme.background, -40);
            }
            ctx.strokeStyle = Theme.background;
            ctx.roundRect(x, y, width, height, 4);
            ctx.fill();
            TextStyles.regular(ctx);
            ctx.fillText(__classPrivateFieldGet(this, _Dropdown_options, "f").text ?? '', x + width / 2, y + height / 2);
        }
        if (this.isActive) {
            const padding = 6, borderRadius = 6;
            y += height;
            const items = __classPrivateFieldGet(this, _Dropdown_options, "f").items.filter(value => value.text), dividers = __classPrivateFieldGet(this, _Dropdown_options, "f").items.filter(value => !value.text);
            let maxWidth = Math.max(...items.map(value => Helper.stringWidth(value.text)))
                + padding * 4;
            if (x + maxWidth > __classPrivateFieldGet(this, _Dropdown_canvas, "f").width - 4)
                x -= x + maxWidth - __classPrivateFieldGet(this, _Dropdown_canvas, "f").width + 4;
            const dropdownOpacity = 'bb', itemOpacityDec = 127, itemBackground = Theme.dropdownItemHoverColor, borderColor = Theme.dropdownBorder;
            ctx.beginPath();
            const rect = {
                x: x,
                y: y,
                width: maxWidth,
                height: items.length * 26
                    + dividers.length * 4
                    + (items.length == 1 ? padding : 0)
                    + (items.length == 2 && dividers.length == 1 ? padding : 0)
            };
            ctx.roundRect(rect.x, rect.y, rect.width, rect.height, borderRadius);
            ctx.fillStyle = Theme.background + dropdownOpacity;
            ctx.setLineDash([]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = borderColor + dropdownOpacity;
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            y += 6;
            for (const item of __classPrivateFieldGet(this, _Dropdown_options, "f").items) {
                ctx.beginPath();
                if (item.isDivider == true) {
                    y += 2;
                    ctx.moveTo(x + padding, y);
                    ctx.lineTo(x + maxWidth - padding, y);
                    ctx.lineWidth = .5;
                    ctx.stroke();
                    y += 4;
                    continue;
                }
                ctx.fillStyle = 'transparent';
                const animationKey = 'animation-dropdown' + item.text;
                const translate = (transition, event, isReturn) => {
                    this.animations.reload(animationKey, event);
                    if (isReturn && transition == 1)
                        return;
                    let opacity = Math.round(itemOpacityDec * transition).toString(16);
                    if (opacity.length == 1)
                        opacity = '0' + opacity;
                    ctx.fillStyle = itemBackground + opacity;
                };
                if (__classPrivateFieldGet(this, _Dropdown_instances, "m", _Dropdown_isOnButton).call(this, moveEvent, x, y, maxWidth, 20)) {
                    this.animations.add(animationKey, AnimationType.MouseOver, {
                        duration: 300,
                        body: transition => {
                            translate(transition, AnimationType.MouseLeave);
                        }
                    });
                    __classPrivateFieldGet(this, _Dropdown_canvas, "f").style.cursor = Styles.Cursor.Pointer;
                    if (clickEvent) {
                        item.action();
                        clickEvent = undefined;
                        this.isActive = false;
                    }
                }
                else {
                    this.animations.add(animationKey, AnimationType.MouseLeave, {
                        timer: Constants.Dates.minDate,
                        duration: 300,
                        backward: true,
                        body: transition => {
                            translate(transition, AnimationType.MouseOver, true);
                        }
                    });
                }
                ctx.roundRect(x + padding, y, maxWidth - padding * 2, 20, borderRadius);
                ctx.fill();
                ctx.fillStyle = Theme.text;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'hanging';
                ctx.fillText(item.text, x + padding * 2, y + 5);
                y += 22;
            }
        }
        ctx.lineWidth = 1;
        if (!__classPrivateFieldGet(this, _Dropdown_isOnlyMenu, "f") && clickEvent != undefined && this.isActive) {
            this.isActive = false;
            clickEvent = undefined;
        }
        __classPrivateFieldSet(this, _Dropdown_isInit, true, "f");
        if (__classPrivateFieldGet(this, _Dropdown_isOnlyMenu, "f") && clickEvent && moveEvent.x == clickEvent.x && moveEvent.y == clickEvent.y) {
            this.isActive = !this.isActive;
            clickEvent = undefined;
        }
        return clickEvent;
    }
    refresh() {
        __classPrivateFieldSet(this, _Dropdown_isInit, false, "f");
    }
    resize() {
        __classPrivateFieldGet(this, _Dropdown_instances, "m", _Dropdown_initAnimations).call(this);
        __classPrivateFieldGet(this, _Dropdown_instances, "m", _Dropdown_calculatePosition).call(this);
    }
}
_Dropdown_canvas = new WeakMap(), _Dropdown_options = new WeakMap(), _Dropdown_canvasPosition = new WeakMap(), _Dropdown_isInit = new WeakMap(), _Dropdown_position = new WeakMap(), _Dropdown_isOnlyMenu = new WeakMap(), _Dropdown_instances = new WeakSet(), _Dropdown_initAnimations = function _Dropdown_initAnimations() {
    __classPrivateFieldSet(this, _Dropdown_canvasPosition, __classPrivateFieldGet(this, _Dropdown_canvas, "f").getBoundingClientRect(), "f");
    __classPrivateFieldGet(this, _Dropdown_canvasPosition, "f").x += scrollX;
    __classPrivateFieldGet(this, _Dropdown_canvasPosition, "f").y += scrollY;
}, _Dropdown_isOnButton = function _Dropdown_isOnButton(event, x, y, w, h) {
    if (!event)
        return false;
    let trueX = event.clientX - __classPrivateFieldGet(this, _Dropdown_canvasPosition, "f").x + scrollX, trueY = event.clientY - __classPrivateFieldGet(this, _Dropdown_canvasPosition, "f").y + scrollY;
    return trueX >= x && trueX <= x + w
        && trueY >= y && trueY <= y + h;
}, _Dropdown_calculatePosition = function _Dropdown_calculatePosition() {
    const width = __classPrivateFieldGet(this, _Dropdown_isOnlyMenu, "f") ? 0 : Helper.stringWidth(__classPrivateFieldGet(this, _Dropdown_options, "f").text ?? '') + 20, height = __classPrivateFieldGet(this, _Dropdown_isOnlyMenu, "f") ? 0 : 24;
    __classPrivateFieldSet(this, _Dropdown_position, {
        x: __classPrivateFieldGet(this, _Dropdown_options, "f").x + width > __classPrivateFieldGet(this, _Dropdown_canvas, "f").width
            ? __classPrivateFieldGet(this, _Dropdown_canvas, "f").width - width
            : __classPrivateFieldGet(this, _Dropdown_options, "f").x < 0
                ? __classPrivateFieldGet(this, _Dropdown_canvas, "f").width + __classPrivateFieldGet(this, _Dropdown_options, "f").x - width
                : __classPrivateFieldGet(this, _Dropdown_options, "f").x,
        y: __classPrivateFieldGet(this, _Dropdown_options, "f").y + height > __classPrivateFieldGet(this, _Dropdown_canvas, "f").height
            ? __classPrivateFieldGet(this, _Dropdown_canvas, "f").height - height
            : __classPrivateFieldGet(this, _Dropdown_options, "f").y < 0
                ? __classPrivateFieldGet(this, _Dropdown_canvas, "f").height + __classPrivateFieldGet(this, _Dropdown_options, "f").y - height
                : __classPrivateFieldGet(this, _Dropdown_options, "f").y,
        width: width,
        height: height
    }, "f");
};
class Export {
    static asPng(canvas, title) {
        requestAnimationFrame(() => {
            const ctx = Canvas.getContext(canvas);
            let width = Helper.stringWidth(TextResources.exportPNG) + 16, height = 64;
            if (width < 50)
                width = 50;
            ctx.clearRect(canvas.width - width, 0, width, height);
            let leftEmpty = 0, rightEmpty = 0;
            const imageData = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
            let isBusy = false;
            for (let i = 0; i < canvas.width; i++) {
                for (let j = 0; j < canvas.height; j++) {
                    if (Canvas.isPixelBusy(imageData[i + j * canvas.width])) {
                        isBusy = true;
                        break;
                    }
                }
                if (isBusy)
                    break;
                leftEmpty++;
            }
            isBusy = false;
            for (let i = canvas.width; i >= 0; i--) {
                for (let j = 0; j < canvas.height; j++) {
                    if (Canvas.isPixelBusy(imageData[i + j * canvas.width])) {
                        isBusy = true;
                        break;
                    }
                }
                if (isBusy)
                    break;
                rightEmpty++;
            }
            if (leftEmpty > 4)
                leftEmpty -= 4;
            if (rightEmpty > 4)
                rightEmpty -= 4;
            if (leftEmpty > rightEmpty)
                leftEmpty = rightEmpty;
            if (rightEmpty > leftEmpty)
                rightEmpty = leftEmpty;
            let destinationCanvas = document.createElement(Tag.Canvas);
            destinationCanvas.width = canvas.width - leftEmpty - rightEmpty;
            destinationCanvas.height = canvas.height;
            const destCtx = Canvas.getContext(destinationCanvas);
            destCtx.fillStyle = Theme.background;
            destCtx.fillRect(0, 0, canvas.width, canvas.height);
            destCtx.drawImage(canvas, -leftEmpty, 0);
            Export.saveAs((title ?? 'chart') + '.png', destinationCanvas.toDataURL('image/png'));
        });
    }
    static asCsv(table, title) {
        let rows = table.querySelectorAll('tr'), csv = [];
        for (let i = 0; i < rows.length; i++) {
            let row = [], cols = rows[i].querySelectorAll('td, th');
            for (let j = 0; j < cols.length; j++) {
                let data = cols[j].innerHTML
                    .replace(/(\r\n|\n|\r)/gm, '')
                    .replace(/(\s\s)/gm, ' ');
                data = data.replace(/"/g, '""');
                row.push('"' + data + '"');
            }
            csv.push(row.join(','));
        }
        Export.saveAs((title ?? 'table') + '.csv', csv.join('\n'), 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv.join('\n')), true);
    }
    static saveAs(name, dataURL, href, isText) {
        if (window.showSaveFilePicker != undefined) {
            const accept = isText
                ? { 'text/csv': '.csv' }
                : { 'image/*': '.png' };
            const options = {
                suggestedName: name,
                types: [
                    {
                        accept: accept
                    }
                ],
                excludeAcceptAllOption: true
            };
            function toBlob(dataURI) {
                const byteString = atob(dataURI.split(',')[1]), mimeString = dataURI.split(',')[0]
                    .split(':')[1]
                    .split(';')[0], buffer = new ArrayBuffer(byteString.length), imageArray = new Uint8Array(buffer);
                for (let i = 0; i < byteString.length; i++)
                    imageArray[i] = byteString.charCodeAt(i);
                return new Blob([buffer], { type: mimeString });
            }
            window.showSaveFilePicker(options)
                .then(fileHandle => {
                fileHandle.createWritable()
                    .then(writableStream => {
                    writableStream.write(isText ? dataURL : toBlob(dataURL))
                        .then(() => writableStream.close());
                });
            });
        }
        else {
            let download = document.createElement(Tag.A);
            download.href = href ?? dataURL;
            download.download = name;
            download.click();
        }
    }
}
class Helper {
    static adjustColor(color, amount) {
        return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2));
    }
    static grayScale(color) {
        return '#' + Array(4).join(Math.round([.3, .59, .11].reduce((a, v, i) => a + v * parseInt(color[2 * i + 1] + color[2 * i + 2], 16), 0) / 3).toString(16).padStart(2, '0'));
    }
    static randomColor() {
        let letters = '0123456789ABCDEF', color = '#';
        for (let i = 0; i < 6; i++)
            color += letters[Math.floor(Math.random() * 16)];
        return color;
    }
    static stringWidth(str, font) {
        const widths = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.2796875, 0.2765625, 0.3546875, 0.5546875, 0.5546875, 0.8890625, 0.665625, 0.190625, 0.3328125, 0.3328125, 0.3890625, 0.5828125, 0.2765625, 0.3328125, 0.2765625, 0.3015625, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.2765625, 0.2765625, 0.584375, 0.5828125, 0.584375, 0.5546875, 1.0140625, 0.665625, 0.665625, 0.721875, 0.721875, 0.665625, 0.609375, 0.7765625, 0.721875, 0.2765625, 0.5, 0.665625, 0.5546875, 0.8328125, 0.721875, 0.7765625, 0.665625, 0.7765625, 0.721875, 0.665625, 0.609375, 0.721875, 0.665625, 0.94375, 0.665625, 0.665625, 0.609375, 0.2765625, 0.3546875, 0.2765625, 0.4765625, 0.5546875, 0.3328125, 0.5546875, 0.5546875, 0.5, 0.5546875, 0.5546875, 0.2765625, 0.5546875, 0.5546875, 0.221875, 0.240625, 0.5, 0.221875, 0.8328125, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.3328125, 0.5, 0.2765625, 0.5546875, 0.5, 0.721875, 0.5, 0.5, 0.5, 0.3546875, 0.259375, 0.353125, 0.5890625];
        const avg = 0.5279276315789471;
        return Array.from(str).reduce((acc, cur) => acc + (widths[cur.charCodeAt(0)] ?? avg), 0) * (font || 14);
    }
    static guid() {
        const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        return (S4() + S4() + '-' + S4() + '-4' + S4().slice(0, 3) + '-' + S4() + '-' + S4() + S4() + S4()).toLowerCase();
    }
    static hexToRgb(hex) {
        if (hex.length > 4) {
            const value = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            if (value)
                return {
                    r: parseInt(value[1], 16),
                    g: parseInt(value[2], 16),
                    b: parseInt(value[3], 16)
                };
        }
        else {
            const value = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
            if (value)
                return {
                    r: parseInt(value[1] + value[1], 16),
                    g: parseInt(value[2] + value[2], 16),
                    b: parseInt(value[3] + value[3], 16)
                };
        }
        return new Color();
    }
    static isColorVisible(background, foreground) {
        const backgroundAsRgb = Helper.hexToRgb(background), foregroundAsRgb = Helper.hexToRgb(foreground), value = .77;
        return (backgroundAsRgb.r + backgroundAsRgb.g + backgroundAsRgb.b) / (foregroundAsRgb.r + foregroundAsRgb.g + foregroundAsRgb.b) < value;
    }
    static isISOString(str) {
        return /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+/.test(str);
    }
}
var _Legend_instances, _Legend_button, _Legend_offset, _Legend_chart, _Legend_hoverCount, _Legend_draw;
class Legend extends Renderable {
    constructor(chart) {
        super(chart);
        _Legend_instances.add(this);
        _Legend_button.set(this, void 0);
        _Legend_offset.set(this, void 0);
        _Legend_chart.set(this, void 0);
        _Legend_hoverCount.set(this, void 0);
        this.isDestroy = false;
        __classPrivateFieldSet(this, _Legend_chart, chart, "f");
        this.calculateSizes();
        if (!this.settings.disableInteractions)
            __classPrivateFieldSet(this, _Legend_button, new Button(this.canvas, {
                x: -10,
                y: 10,
                text: TextResources.reset,
                action: () => {
                    for (let value of this.settings.data.values)
                        value.reset();
                }
            }), "f");
        __classPrivateFieldSet(this, _Legend_offset, {
            x: Legend.getOffsetToCenter(this.settings.data.values, this.canvas.width),
            y: (this.canvas.height - Legend.getLegendHeight(this.settings.data.values, this.canvas.width)) / 2
        }, "f");
    }
    render() {
        super.render();
        const ctx = Canvas.getContext(this.canvas);
        let nextPoint = { x: 20, y: 21 };
        this.canvas.style.cursor = Styles.Cursor.Default;
        TextStyles.regular(ctx);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
        ctx.translate(__classPrivateFieldGet(this, _Legend_offset, "f").x, __classPrivateFieldGet(this, _Legend_offset, "f").y);
        __classPrivateFieldSet(this, _Legend_hoverCount, 0, "f");
        for (const value of this.settings.data.values.filter(v => !v.hideInLegend))
            nextPoint = __classPrivateFieldGet(this, _Legend_instances, "m", _Legend_draw).call(this, value, nextPoint.x, nextPoint.y);
        ctx.translate(-__classPrivateFieldGet(this, _Legend_offset, "f").x, -__classPrivateFieldGet(this, _Legend_offset, "f").y);
        if (!this.isDestroy)
            requestAnimationFrame(this.render.bind(this));
        this.onClickEvent = __classPrivateFieldGet(this, _Legend_button, "f")?.render(this.onMouseMoveEvent, this.onClickEvent);
        this.state = RenderState.Idle;
    }
    destroy() {
        this.isDestroy = true;
        this.canvas.remove();
    }
    refresh() {
        this.state = RenderState.Init;
    }
    resize() {
        this.calculateSizes();
        __classPrivateFieldGet(this, _Legend_button, "f")?.resize();
        this.initAnimations();
    }
    calculateSizes() {
        switch (this.settings.legendPlace) {
            case LegendPlace.Bottom:
            default:
                this.canvas.width = this.settings.width;
                this.canvas.height = Legend.getLegendHeight(this.settings.data.values, this.canvas.width);
                this.node.style.flexDirection = Styles.FlexDirection.Column;
                break;
            case LegendPlace.Top:
                this.canvas.width = this.settings.width;
                this.canvas.height = Legend.getLegendHeight(this.settings.data.values, this.canvas.width);
                this.node.style.flexDirection = Styles.FlexDirection.ColumnReverse;
                break;
            case LegendPlace.Left:
                this.canvas.width = 500;
                this.canvas.height = this.settings.height;
                this.node.style.flexDirection = Styles.FlexDirection.Row;
                break;
            case LegendPlace.Right:
                this.canvas.width = 500;
                this.canvas.height = this.settings.height;
                this.node.style.flexDirection = Styles.FlexDirection.RowReverse;
                break;
        }
    }
    static getOffsetToCenter(values, width) {
        let maxWidth = 20;
        for (const value of values.filter(v => !v.hideInLegend)) {
            const labelWidth = Helper.stringWidth(value.label);
            if (maxWidth + labelWidth + 47 >= width - 100)
                break;
            maxWidth += labelWidth + 47;
        }
        return width / 2 - maxWidth / 2;
    }
    static getLegendHeight(values, width) {
        let count = 1, acc = 20, offset = Legend.getOffsetToCenter(values, width);
        for (const value of values.filter(v => !v.hideInLegend)) {
            const labelWidth = Helper.stringWidth(value.label);
            if (acc + labelWidth + 48 >= width - 32 - offset) {
                acc = 20;
                count++;
            }
            acc += labelWidth + 48;
        }
        return 24 + count * 20 + (count - 1) * 6;
    }
}
_Legend_button = new WeakMap(), _Legend_offset = new WeakMap(), _Legend_chart = new WeakMap(), _Legend_hoverCount = new WeakMap(), _Legend_instances = new WeakSet(), _Legend_draw = function _Legend_draw(value, x, y) {
    var _a;
    const ctx = Canvas.getContext(this.canvas);
    const textWidth = Helper.stringWidth(value.label), circleRadius = 6;
    if (x + 48 + textWidth >= this.canvas.width - 40 - __classPrivateFieldGet(this, _Legend_offset, "f").x) {
        x = 20;
        y += 26;
    }
    let rectX = x - circleRadius - circleRadius, rectY = y - circleRadius / 2 - circleRadius, rectW = circleRadius + circleRadius + textWidth + 18, rectH = 20;
    const isHover = (event) => {
        if (!event)
            return false;
        const px = event.clientX - this.canvasPosition.x + scrollX - __classPrivateFieldGet(this, _Legend_offset, "f").x, py = event.clientY - this.canvasPosition.y + scrollY - __classPrivateFieldGet(this, _Legend_offset, "f").y;
        return px >= rectX && px <= rectX + rectW
            && py >= rectY && py <= rectY + rectH;
    };
    const translate = (transition, event) => {
        this.animations.reload(value.id, event);
        ctx.beginPath();
        ctx.roundRect(rectX, rectY, rectW, rectH, circleRadius);
        ctx.fillStyle = Helper.adjustColor(Theme.canvasBackground, Math.round(-25 * transition));
        ctx.fill();
    };
    this.animations.add(value.id, AnimationType.Click, {
        duration: Constants.Animations.legend,
        continuous: true,
        before: () => {
            return this.onClickEvent != undefined
                && (isHover(this.onClickEvent)
                    || (value instanceof Sector
                        && value.current !== 0
                        && value.value !== value.current))
                && value.checkCondition();
        },
        body: transition => {
            value.toggle(transition);
            if (transition == 1)
                this.onClickEvent = new PointerEvent(Events.Click);
        }
    });
    if (isHover(this.onMouseMoveEvent)) {
        this.animations.add(value.id, AnimationType.MouseOver, {
            duration: Constants.Animations.button,
            body: transition => {
                translate(transition, AnimationType.MouseLeave);
            }
        });
        if (!value.disabled) {
            __classPrivateFieldSet(this, _Legend_hoverCount, (_a = __classPrivateFieldGet(this, _Legend_hoverCount, "f"), _a++, _a), "f");
            __classPrivateFieldGet(this, _Legend_chart, "f").highlight(value);
        }
        this.canvas.style.cursor = Styles.Cursor.Pointer;
    }
    else {
        this.animations.add(value.id, AnimationType.MouseLeave, {
            timer: Constants.Dates.minDate,
            duration: Constants.Animations.button,
            backward: true,
            body: transition => {
                translate(transition, AnimationType.MouseOver);
            }
        });
        if (__classPrivateFieldGet(this, _Legend_hoverCount, "f") == 0)
            __classPrivateFieldGet(this, _Legend_chart, "f").highlight();
    }
    ctx.beginPath();
    ctx.arc(x - 1, y + 1, 3, 0, 2 * Math.PI);
    ctx.fillStyle = value.disabled ? Helper.grayScale(value.color) : value.color;
    ctx.fill();
    ctx.fillStyle = Theme.text;
    if (value.disabled)
        ctx.fillStyle += '7f';
    ctx.fillText(value.label, x + circleRadius * 1.5 + 1, y + 6);
    x += 20;
    if (value.disabled) {
        ctx.moveTo(x - 10, y + 2);
        ctx.lineTo(x + textWidth - 10, y + 2);
        ctx.strokeStyle = Theme.text + '7f';
        ctx.stroke();
    }
    x += textWidth + 22;
    return {
        x: x,
        y: y
    };
};
var _Modal_instances, _Modal_content, _Modal_setHeader, _Modal_setContent;
class Modal {
    constructor(content, size) {
        _Modal_instances.add(this);
        _Modal_content.set(this, void 0);
        this.modal = document.createElement(Tag.Dialog);
        this.modal.classList.add('o-modal');
        if (size) {
            this.modal.style.width = `${size.width}px`;
            this.modal.style.height = `${size.height}px`;
        }
        this.modal.oncancel = () => this.close();
        document.body.appendChild(this.modal);
        __classPrivateFieldGet(this, _Modal_instances, "m", _Modal_setHeader).call(this);
        __classPrivateFieldGet(this, _Modal_instances, "m", _Modal_setContent).call(this, content);
    }
    open() {
        Errors.throwIsUndefined(this.modal, ErrorType.ElementNotExist);
        this.modal.showModal();
    }
    close() {
        Errors.throwIsUndefined(this.modal, ErrorType.ElementNotExist);
        this.modal.close();
        this.modal.remove();
        this.modal = undefined;
    }
}
_Modal_content = new WeakMap(), _Modal_instances = new WeakSet(), _Modal_setHeader = function _Modal_setHeader() {
    Errors.throwIsUndefined(this.modal, ErrorType.ElementNotExist);
    let closeButton = document.createElement('button');
    closeButton.classList.add('o-modal-close');
    closeButton.innerHTML = 'x';
    this.modal.appendChild(closeButton);
    closeButton.onclick = () => this.close();
}, _Modal_setContent = function _Modal_setContent(content) {
    if (__classPrivateFieldGet(this, _Modal_content, "f") == undefined) {
        __classPrivateFieldSet(this, _Modal_content, document.createElement(Tag.Div), "f");
        __classPrivateFieldGet(this, _Modal_content, "f").classList.add('o-modal-content');
        this.modal?.appendChild(__classPrivateFieldGet(this, _Modal_content, "f"));
    }
    if (content != undefined)
        __classPrivateFieldGet(this, _Modal_content, "f").appendChild(content);
};
function OCharts() {
}
OCharts.chart = function (context, settings) {
    return new Chart(context, settings);
};
window.OCharts = OCharts;
Number.prototype.isAnyEquals = function (...values) {
    return values.includes(this);
};
Date.prototype.addDays = function (days) {
    let result = new Date(this);
    result.setDate(result.getDate() + days);
    return result;
};
Date.prototype.addMilliseconds = function (milliseconds) {
    let result = new Date(this);
    result.setMilliseconds(result.getMilliseconds() + milliseconds);
    return result;
};
Map.prototype.trySet = function (key, value) {
    if (!this.has(key))
        this.set(key, value);
};
class ThemeOptions {
}
ThemeOptions.colors = ['#000000', '#ffffff'];
ThemeOptions.backgrounds = ['#f7f7f7', '#222222'];
ThemeOptions.lines = ['#000000', '#eeeeee'];
ThemeOptions.lineAxes = ['#dedede', '#212121'];
ThemeOptions.lineActives = ['#898989', '#898989'];
ThemeOptions.dropdownBorders = ['#bcbcbc', '#7e7e7e'];
ThemeOptions.canvasBackgrounds = ['#ffffff', '#222222'];
class Theme {
    static initialize(callback, isDark) {
        if (!Theme.function && isDark)
            Theme.function = isDark;
        if (window.matchMedia
            && window.matchMedia('(prefers-color-scheme: dark)').matches
            && (!Theme.function || Theme.function()))
            Theme.setTheme(1);
        else
            Theme.setTheme(0);
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener(Events.Change, event => {
            Theme.setTheme(event.matches && (!Theme.function || Theme.function()) ? 1 : 0);
            callback();
        });
    }
    static setTheme(index) {
        Theme.currentTheme = index;
        Theme.text = ThemeOptions.colors[index];
        Theme.background = ThemeOptions.backgrounds[index];
        Theme.line = ThemeOptions.lines[index];
        Theme.lineAxis = ThemeOptions.lineAxes[index];
        Theme.lineActive = ThemeOptions.lineActives[index];
        Theme.dropdownItemHoverColor = Helper.adjustColor(Theme.background, index == 0 ? -50 : 50);
        Theme.dropdownBorder = ThemeOptions.dropdownBorders[index];
        Theme.canvasBackground = ThemeOptions.canvasBackgrounds[index];
    }
    static reset() {
        this.function = undefined;
    }
}
Theme.currentTheme = 0;
var _Tooltip_instances, _Tooltip_enabled, _Tooltip_isCustom, _Tooltip_canvasPosition, _Tooltip_template, _Tooltip_inProgress, _Tooltip_toHide, _Tooltip_timer, _Tooltip_lines, _Tooltip_renderRegular, _Tooltip_renderCustom, _Tooltip_hideAll, _Tooltip_getOpacityValue;
class Tooltip {
    constructor(canvas, settings) {
        _Tooltip_instances.add(this);
        _Tooltip_enabled.set(this, void 0);
        _Tooltip_isCustom.set(this, void 0);
        _Tooltip_canvasPosition.set(this, void 0);
        _Tooltip_template.set(this, void 0);
        _Tooltip_inProgress.set(this, void 0);
        _Tooltip_toHide.set(this, void 0);
        _Tooltip_timer.set(this, void 0);
        _Tooltip_lines.set(this, void 0);
        this.canvas = canvas;
        this.data = settings.data;
        __classPrivateFieldSet(this, _Tooltip_enabled, settings.enableTooltip, "f");
        __classPrivateFieldSet(this, _Tooltip_isCustom, !!settings.templateId, "f");
        if (__classPrivateFieldGet(this, _Tooltip_isCustom, "f"))
            __classPrivateFieldSet(this, _Tooltip_template, document.getElementById(settings.templateId), "f");
        this.refresh();
    }
    render(condition, event, lines, value) {
        __classPrivateFieldGet(this, _Tooltip_instances, "m", _Tooltip_hideAll).call(this);
        if (!__classPrivateFieldGet(this, _Tooltip_enabled, "f") || !event)
            return;
        if (condition || __classPrivateFieldGet(this, _Tooltip_inProgress, "f") || __classPrivateFieldGet(this, _Tooltip_toHide, "f")) {
            if (condition)
                __classPrivateFieldSet(this, _Tooltip_lines, lines, "f");
            if (!__classPrivateFieldGet(this, _Tooltip_timer, "f"))
                __classPrivateFieldSet(this, _Tooltip_timer, new Date(), "f");
            if (!__classPrivateFieldGet(this, _Tooltip_toHide, "f"))
                __classPrivateFieldSet(this, _Tooltip_inProgress, true, "f");
            else if (__classPrivateFieldGet(this, _Tooltip_inProgress, "f"))
                __classPrivateFieldSet(this, _Tooltip_timer, new Date(), "f");
            if (__classPrivateFieldGet(this, _Tooltip_isCustom, "f"))
                __classPrivateFieldGet(this, _Tooltip_instances, "m", _Tooltip_renderCustom).call(this, event, value);
            else
                __classPrivateFieldGet(this, _Tooltip_instances, "m", _Tooltip_renderRegular).call(this, event);
            const opacityValue = __classPrivateFieldGet(this, _Tooltip_instances, "m", _Tooltip_getOpacityValue).call(this);
            if (__classPrivateFieldGet(this, _Tooltip_toHide, "f") && opacityValue >= 1) {
                __classPrivateFieldSet(this, _Tooltip_inProgress, false, "f");
                __classPrivateFieldSet(this, _Tooltip_toHide, false, "f");
            }
            if (__classPrivateFieldGet(this, _Tooltip_toHide, "f") && opacityValue <= 0) {
                __classPrivateFieldSet(this, _Tooltip_inProgress, false, "f");
                __classPrivateFieldSet(this, _Tooltip_toHide, false, "f");
                __classPrivateFieldSet(this, _Tooltip_timer, undefined, "f");
            }
            if (!condition && __classPrivateFieldGet(this, _Tooltip_timer, "f") != undefined)
                __classPrivateFieldSet(this, _Tooltip_toHide, true, "f");
        }
        else {
            __classPrivateFieldSet(this, _Tooltip_timer, undefined, "f");
        }
    }
    refresh() {
        __classPrivateFieldSet(this, _Tooltip_canvasPosition, this.canvas.getBoundingClientRect(), "f");
        __classPrivateFieldGet(this, _Tooltip_canvasPosition, "f").x += scrollX;
        __classPrivateFieldGet(this, _Tooltip_canvasPosition, "f").y += scrollY;
    }
}
_Tooltip_enabled = new WeakMap(), _Tooltip_isCustom = new WeakMap(), _Tooltip_canvasPosition = new WeakMap(), _Tooltip_template = new WeakMap(), _Tooltip_inProgress = new WeakMap(), _Tooltip_toHide = new WeakMap(), _Tooltip_timer = new WeakMap(), _Tooltip_lines = new WeakMap(), _Tooltip_instances = new WeakSet(), _Tooltip_renderRegular = function _Tooltip_renderRegular(event) {
    const ctx = Canvas.getContext(this.canvas);
    const textWidth = Math.max(...__classPrivateFieldGet(this, _Tooltip_lines, "f").map(line => Helper.stringWidth(line.text ?? '') + (line.color ? 8 : 0)));
    const padding = 6, borderRadius = 6;
    let x = event.clientX - __classPrivateFieldGet(this, _Tooltip_canvasPosition, "f").x + 10, y = event.clientY - __classPrivateFieldGet(this, _Tooltip_canvasPosition, "f").y + scrollY + 10;
    if (x + textWidth + 25 > __classPrivateFieldGet(this, _Tooltip_canvasPosition, "f").width)
        x = __classPrivateFieldGet(this, _Tooltip_canvasPosition, "f").width - (textWidth + 25);
    if (y + 4 + __classPrivateFieldGet(this, _Tooltip_lines, "f").length * 18 > __classPrivateFieldGet(this, _Tooltip_canvasPosition, "f").height)
        y = __classPrivateFieldGet(this, _Tooltip_canvasPosition, "f").height - 4 - __classPrivateFieldGet(this, _Tooltip_lines, "f").length * 18;
    ctx.beginPath();
    ctx.roundRect(x, y, textWidth + 24, 16 + 16 * __classPrivateFieldGet(this, _Tooltip_lines, "f").length, borderRadius);
    let opacity = Math.round(__classPrivateFieldGet(this, _Tooltip_instances, "m", _Tooltip_getOpacityValue).call(this) * 255).toString(16), baseOpacity = Math.round(__classPrivateFieldGet(this, _Tooltip_instances, "m", _Tooltip_getOpacityValue).call(this) * 207).toString(16);
    if (opacity.length == 1)
        opacity = '0' + opacity;
    if (baseOpacity.length == 1)
        baseOpacity = '0' + baseOpacity;
    ctx.strokeStyle = Theme.dropdownBorder + baseOpacity;
    ctx.lineWidth = 1;
    ctx.fillStyle = Theme.background + baseOpacity;
    ctx.stroke();
    ctx.fill();
    for (let line of __classPrivateFieldGet(this, _Tooltip_lines, "f")) {
        let offset = 0;
        if (line.color) {
            offset = 12;
            ctx.beginPath();
            ctx.fillStyle = line.color + opacity;
            ctx.arc(x + 16, y + 17, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        TextStyles.tooltip(ctx);
        ctx.fillStyle = Theme.text + opacity;
        ctx.fillText(line.text ?? '', x + offset + padding * 2, y + 21);
        y += 16;
    }
}, _Tooltip_renderCustom = function _Tooltip_renderCustom(event, value) {
    if (value == undefined)
        return;
    const id = __classPrivateFieldGet(this, _Tooltip_template, "f").id + value.id;
    let tooltip = document.getElementById(id);
    const updateVisibility = () => {
        __classPrivateFieldGet(this, _Tooltip_instances, "m", _Tooltip_hideAll).call(this);
        tooltip.style.visibility = Styles.Visibility.Visible;
    };
    if (!tooltip) {
        const regex = /\${[^}]*}/gm;
        let content = __classPrivateFieldGet(this, _Tooltip_template, "f").cloneNode(true);
        tooltip = document.createElement(Tag.Div);
        tooltip.innerHTML = content.innerHTML;
        tooltip.id = id;
        tooltip.style.position = Styles.Position.Absolute;
        tooltip.style.pointerEvents = Styles.PointerEvents.None;
        tooltip.style.visibility = Styles.Visibility.Visible;
        tooltip.setAttribute(Attribute.Name, __classPrivateFieldGet(this, _Tooltip_template, "f").id);
        const matches = [...tooltip.innerHTML.matchAll(regex)];
        let html = tooltip.innerHTML;
        for (const match of matches) {
            const property = match[0].replace('${', '')
                .replace('}', '')
                .replaceAll(' ', '');
            html = html.replaceAll(match[0], value.data[property]);
        }
        tooltip.innerHTML = html;
        document.body.appendChild(tooltip);
        tooltip.position = tooltip.getBoundingClientRect();
        updateVisibility();
    }
    if (tooltip.style.visibility == Styles.Visibility.Hidden)
        updateVisibility();
    if (tooltip.position.height == 0)
        tooltip.position = tooltip.getBoundingClientRect();
    const offset = 10;
    let opacity = '1';
    let x = event.clientX, y = event.clientY + scrollY;
    if (x + tooltip.position.width - __classPrivateFieldGet(this, _Tooltip_canvasPosition, "f").x > __classPrivateFieldGet(this, _Tooltip_canvasPosition, "f").width - offset) {
        x = __classPrivateFieldGet(this, _Tooltip_canvasPosition, "f").width - tooltip.position.width + __classPrivateFieldGet(this, _Tooltip_canvasPosition, "f").x - offset;
        opacity = '.67';
    }
    if (y + tooltip.position.height - __classPrivateFieldGet(this, _Tooltip_canvasPosition, "f").y > __classPrivateFieldGet(this, _Tooltip_canvasPosition, "f").height - offset) {
        y = __classPrivateFieldGet(this, _Tooltip_canvasPosition, "f").height - tooltip.position.height + __classPrivateFieldGet(this, _Tooltip_canvasPosition, "f").y - offset;
        opacity = '.67';
    }
    tooltip.style.left = x + offset + 'px';
    tooltip.style.top = y + offset + 'px';
    tooltip.style.opacity = opacity;
}, _Tooltip_hideAll = function _Tooltip_hideAll() {
    if (!__classPrivateFieldGet(this, _Tooltip_isCustom, "f"))
        return;
    const tooltips = document.querySelectorAll(`[name="${__classPrivateFieldGet(this, _Tooltip_template, "f").id}"]`);
    for (let node of tooltips)
        node.style.visibility = Styles.Visibility.Hidden;
}, _Tooltip_getOpacityValue = function _Tooltip_getOpacityValue() {
    if (!__classPrivateFieldGet(this, _Tooltip_timer, "f"))
        return 0;
    let opacityValue = __classPrivateFieldGet(this, _Tooltip_toHide, "f")
        ? 1 - (new Date().getTime() - __classPrivateFieldGet(this, _Tooltip_timer, "f").getTime()) / Constants.Animations.tooltip
        : (new Date().getTime() - __classPrivateFieldGet(this, _Tooltip_timer, "f").getTime()) / Constants.Animations.tooltip;
    if (opacityValue > 1)
        opacityValue = 1;
    if (opacityValue < 0)
        opacityValue = 0;
    return opacityValue;
};
class Canvas {
    static getContext(canvas) {
        return canvas.getContext('2d', { willReadFrequently: true })
            ?? Errors.throw(ErrorType.NullContext);
    }
    static isPixelBusy(pixel) {
        return pixel & 0xff000000;
    }
}
class Errors {
    static throw(error) {
        throw new Error(error);
    }
    static throwIsUndefined(object, error) {
        if (object == undefined)
            Errors.throw(error);
    }
}
class Formatter {
}
Formatter.number = (value) => value?.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
}) ?? '';
Formatter.date = (value) => value.toLocaleDateString();
class TextStyles {
    static title(context) {
        context.fillStyle = Theme.text;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '20px sans-serif';
    }
    static regular(context) {
        context.fillStyle = Theme.text;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '14px sans-serif';
    }
    static large(context) {
        context.fillStyle = Theme.text;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '16px sans-serif';
    }
    static tooltip(context) {
        context.font = '14px sans-serif';
        context.textAlign = 'start';
        context.textBaseline = 'alphabetic';
    }
    static circularLabel(context, isRight) {
        context.textAlign = isRight ? 'start' : 'end';
        context.textBaseline = 'alphabetic';
        context.font = '14px sans-serif';
    }
}
var _CircularRenderer_instances, _CircularRenderer_canRenderInnerTitle, _CircularRenderer_isDonut, _CircularRenderer_radius, _CircularRenderer_sum, _CircularRenderer_accumulator, _CircularRenderer_animationOffset, _CircularRenderer_hoverCount, _CircularRenderer_currentHover, _CircularRenderer_pinned, _CircularRenderer_center, _CircularRenderer_startPoint, _CircularRenderer_angles, _CircularRenderer_other, _CircularRenderer_innerTitleStyle, _CircularRenderer_startAngle, _CircularRenderer_draw, _CircularRenderer_drawSector, _CircularRenderer_getPoint, _CircularRenderer_isInsideSector, _CircularRenderer_drawEmpty, _CircularRenderer_drawInnerTitle, _CircularRenderer_calculateSizes;
class CircularRenderer extends Renderer {
    constructor(chart) {
        super(chart);
        _CircularRenderer_instances.add(this);
        _CircularRenderer_canRenderInnerTitle.set(this, void 0);
        _CircularRenderer_isDonut.set(this, void 0);
        _CircularRenderer_radius.set(this, void 0);
        _CircularRenderer_sum.set(this, void 0);
        _CircularRenderer_accumulator.set(this, void 0);
        _CircularRenderer_animationOffset.set(this, void 0);
        _CircularRenderer_hoverCount.set(this, void 0);
        _CircularRenderer_currentHover.set(this, void 0);
        _CircularRenderer_pinned.set(this, void 0);
        _CircularRenderer_center.set(this, void 0);
        _CircularRenderer_startPoint.set(this, void 0);
        _CircularRenderer_angles.set(this, void 0);
        _CircularRenderer_other.set(this, void 0);
        _CircularRenderer_innerTitleStyle.set(this, void 0);
        _CircularRenderer_startAngle.set(this, void 0);
        this.data.values = this.data.values.map(v => new Sector(v));
        if (this.settings.enableOther) {
            if (!this.settings.contextMenu)
                this.settings.contextMenu = [];
            else
                this.settings.contextMenu.push({
                    isDivider: true
                });
            this.settings.contextMenu.push({
                text: TextResources.Show,
                condition: data => data?._other,
                action: () => {
                    new Modal(Decomposition.toChart(this.settings, __classPrivateFieldGet(this, _CircularRenderer_other, "f")), {
                        width: window.innerWidth * .8,
                        height: window.innerHeight * .8
                    })
                        .open();
                }
            });
        }
        __classPrivateFieldSet(this, _CircularRenderer_startAngle, Math.random() % (Math.PI * 2), "f");
        __classPrivateFieldSet(this, _CircularRenderer_pinned, [], "f");
        this.onMouseMoveEvent = new MouseEvent(Events.MouseMove);
    }
    render() {
        super.render();
        __classPrivateFieldSet(this, _CircularRenderer_accumulator, __classPrivateFieldGet(this, _CircularRenderer_startAngle, "f"), "f");
        __classPrivateFieldSet(this, _CircularRenderer_hoverCount, 0, "f");
        if (this.data.values.filter(v => !v.disabled).length == 0)
            __classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_drawEmpty).call(this);
        else
            __classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_draw).call(this);
        if (__classPrivateFieldGet(this, _CircularRenderer_hoverCount, "f") == 0)
            __classPrivateFieldSet(this, _CircularRenderer_currentHover, undefined, "f");
        this.state = RenderState.Idle;
        super.renderDropdown();
        if (__classPrivateFieldGet(this, _CircularRenderer_currentHover, "f") || this.contextMenu)
            this.renderContextMenu(this.data.values.find(v => v.id == __classPrivateFieldGet(this, _CircularRenderer_currentHover, "f"))?.data ?? {});
        else
            this.onContextMenuEvent = undefined;
        if (__classPrivateFieldGet(this, _CircularRenderer_currentHover, "f"))
            this.canvas.style.cursor = Styles.Cursor.Pointer;
    }
    refresh() {
        super.refresh();
        this.dropdown?.refresh();
    }
    resize() {
        super.resize();
        this.initAnimations();
        __classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_calculateSizes).call(this);
        this.dropdown?.resize();
    }
    prepareSettings() {
        super.prepareSettings();
        __classPrivateFieldSet(this, _CircularRenderer_isDonut, (this.data.innerRadius ?? 0) != 0, "f");
        for (let item of this.data.values) {
            item.disabled = !item.value;
            item.value ??= 0;
            item.current = item.value;
            item.innerRadius ??= this.data.innerRadius ?? 0;
            if (item.value < 0)
                console.warn(`"${item.label}" has negative value (${item.value}) and will not be render`);
        }
        this.data.values = this.data.values.filter(v => v.value >= 0);
        if (this.settings.enableOther && this.data.values.length > 20) {
            __classPrivateFieldSet(this, _CircularRenderer_other, this.data.values.splice(20), "f");
            const sum = __classPrivateFieldGet(this, _CircularRenderer_other, "f").reduce((acc, v) => acc + v.current, 0);
            this.data.values = this.data.values.slice(0, 20);
            this.data.values.push(new Sector({
                value: sum,
                current: sum,
                label: TextResources.other,
                id: Helper.guid(),
                color: __classPrivateFieldGet(this, _CircularRenderer_other, "f")[__classPrivateFieldGet(this, _CircularRenderer_other, "f").length - 1].color,
                innerRadius: this.data.innerRadius,
                data: {
                    _other: true
                }
            }));
        }
    }
    initDropdown() {
        super.initDropdown();
        this.dropdown = new Dropdown(this.canvas, {
            x: -10,
            y: 10,
            text: TextResources.menu,
            items: [
                {
                    text: TextResources.exportPNG,
                    action: () => {
                        Export.asPng(this.canvas, this.settings.title);
                    }
                },
                {
                    text: TextResources.exportCSV,
                    action: () => {
                        Export.asCsv(Decomposition.toTable(CircularData.getRows(this.data)), this.settings.title);
                    }
                },
                {
                    isDivider: true
                },
                {
                    text: TextResources.decomposeToTable,
                    action: () => {
                        new Modal(Decomposition.toTable(CircularData.getRows(this.data))).open();
                    }
                }
            ]
        });
    }
}
_CircularRenderer_canRenderInnerTitle = new WeakMap(), _CircularRenderer_isDonut = new WeakMap(), _CircularRenderer_radius = new WeakMap(), _CircularRenderer_sum = new WeakMap(), _CircularRenderer_accumulator = new WeakMap(), _CircularRenderer_animationOffset = new WeakMap(), _CircularRenderer_hoverCount = new WeakMap(), _CircularRenderer_currentHover = new WeakMap(), _CircularRenderer_pinned = new WeakMap(), _CircularRenderer_center = new WeakMap(), _CircularRenderer_startPoint = new WeakMap(), _CircularRenderer_angles = new WeakMap(), _CircularRenderer_other = new WeakMap(), _CircularRenderer_innerTitleStyle = new WeakMap(), _CircularRenderer_startAngle = new WeakMap(), _CircularRenderer_instances = new WeakSet(), _CircularRenderer_draw = function _CircularRenderer_draw() {
    if (this.onMouseMoveEvent || this.state == RenderState.Init) {
        __classPrivateFieldSet(this, _CircularRenderer_sum, this.data.values.reduce((acc, v) => acc + v.current, 0), "f");
        let anglesSum = __classPrivateFieldGet(this, _CircularRenderer_startAngle, "f");
        __classPrivateFieldSet(this, _CircularRenderer_angles, this.data.values.flatMap(sector => {
            const angle = sector.current / __classPrivateFieldGet(this, _CircularRenderer_sum, "f") * 2 * Math.PI;
            return {
                id: sector.id,
                value: angle,
                sum: (anglesSum += angle) - angle
            };
        })
            .reverse(), "f");
        __classPrivateFieldSet(this, _CircularRenderer_startPoint, __classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_getPoint).call(this, __classPrivateFieldGet(this, _CircularRenderer_radius, "f"), 0), "f");
        for (const value of this.data.values)
            __classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_drawSector).call(this, value);
        const value = this.data.values.find(v => v.id == __classPrivateFieldGet(this, _CircularRenderer_currentHover, "f"));
        this.tooltip.render(!!value && !this.dropdown?.isActive, this.onMouseMoveEvent, [
            new TooltipValue(`${value?.label}: ${Formatter.number(value?.current)}`)
        ], value);
        __classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_drawInnerTitle).call(this);
    }
    if (!this.isDestroy)
        requestAnimationFrame(this.render.bind(this));
}, _CircularRenderer_drawSector = function _CircularRenderer_drawSector(value) {
    var _a;
    const ctx = Canvas.getContext(this.canvas);
    ctx.fillStyle = value.color;
    ctx.strokeStyle = value.color;
    const piece = value.current / __classPrivateFieldGet(this, _CircularRenderer_sum, "f"), angle = (isNaN(piece) ? 1 : piece) * 2 * Math.PI;
    const isSingle = this.data.values.filter(s => !s.disabled).length == 1;
    if ((!!this.onClickEvent || __classPrivateFieldGet(this, _CircularRenderer_pinned, "f").includes(value.id))
        && !this.animations.contains(value.id, AnimationType.Init)
        && !isSingle) {
        this.animations.add(value.id, AnimationType.Click, {
            duration: Constants.Animations.circular,
            before: () => {
                if (!!this.onClickEvent) {
                    if (__classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_isInsideSector).call(this, this.onClickEvent, value)) {
                        if (__classPrivateFieldGet(this, _CircularRenderer_pinned, "f").includes(value.id))
                            __classPrivateFieldSet(this, _CircularRenderer_pinned, __classPrivateFieldGet(this, _CircularRenderer_pinned, "f").filter(id => id != value.id), "f");
                        else
                            __classPrivateFieldGet(this, _CircularRenderer_pinned, "f").push(value.id);
                        this.onClickEvent = new PointerEvent(Events.Click);
                    }
                }
                return true;
            },
            body: () => {
                if (!__classPrivateFieldGet(this, _CircularRenderer_pinned, "f").includes(value.id))
                    return;
                const piece = value.current / __classPrivateFieldGet(this, _CircularRenderer_sum, "f"), angle = (isNaN(piece) ? 1 : piece) * 2 * Math.PI, direction = __classPrivateFieldGet(this, _CircularRenderer_accumulator, "f") + angle / 2;
                const transition = {
                    x: __classPrivateFieldGet(this, _CircularRenderer_animationOffset, "f") * Math.cos(direction),
                    y: __classPrivateFieldGet(this, _CircularRenderer_animationOffset, "f") * Math.sin(direction)
                };
                ctx.translate(transition.x, transition.y);
                ctx.lineWidth = 8;
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.fillStyle = value.color;
            }
        });
    }
    if (this.onMouseMoveEvent && __classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_isInsideSector).call(this, this.onMouseMoveEvent, value)) {
        __classPrivateFieldSet(this, _CircularRenderer_currentHover, value.id, "f");
        __classPrivateFieldSet(this, _CircularRenderer_hoverCount, (_a = __classPrivateFieldGet(this, _CircularRenderer_hoverCount, "f"), _a++, _a), "f");
    }
    if (this.state == RenderState.Init || this.animations.contains(value.id, AnimationType.Init)) {
        this.animations.add(value.id, AnimationType.Init, {
            duration: Constants.Animations.circular + (this.data.values.indexOf(value) + 1) / this.data.values.length * Constants.Animations.circular,
            continuous: true,
            body: transition => {
                const centerOfSector = {
                    x: __classPrivateFieldGet(this, _CircularRenderer_center, "f").x + __classPrivateFieldGet(this, _CircularRenderer_radius, "f") / 2 * Math.cos(__classPrivateFieldGet(this, _CircularRenderer_accumulator, "f") + angle / 2),
                    y: __classPrivateFieldGet(this, _CircularRenderer_center, "f").y + __classPrivateFieldGet(this, _CircularRenderer_radius, "f") / 2 * Math.sin(__classPrivateFieldGet(this, _CircularRenderer_accumulator, "f") + angle / 2)
                };
                const minSize = .7, rest = 1 - minSize;
                ctx.translate(centerOfSector.x - centerOfSector.x * (minSize + transition * rest), centerOfSector.y - centerOfSector.y * (minSize + transition * rest));
                ctx.scale((minSize + transition * rest), (minSize + transition * rest));
                let opacity = Math.round(255 * transition).toString(16);
                if (opacity.length < 2)
                    opacity = 0 + opacity;
                ctx.fillStyle = value.color + opacity;
                ctx.strokeStyle = value.color + opacity;
            }
        });
    }
    else if (this.onMouseMoveEvent
        && !this.animations.contains(value.id, AnimationType.Init)
        && !__classPrivateFieldGet(this, _CircularRenderer_pinned, "f").includes(value.id)
        && !isSingle) {
        const translate = (transition, event, swap) => {
            this.animations.reload(value.id, event);
            ctx.lineWidth = 1;
            ctx.lineJoin = 'miter';
            ctx.lineCap = 'butt';
            if (transition == 0)
                return;
            if (swap)
                transition = value.transition;
            const piece = value.current / __classPrivateFieldGet(this, _CircularRenderer_sum, "f"), angle = (isNaN(piece) ? 1 : piece) * 2 * Math.PI, direction = __classPrivateFieldGet(this, _CircularRenderer_accumulator, "f") + angle / 2, translate = {
                x: __classPrivateFieldGet(this, _CircularRenderer_animationOffset, "f") * Math.cos(direction) * transition,
                y: __classPrivateFieldGet(this, _CircularRenderer_animationOffset, "f") * Math.sin(direction) * transition
            };
            ctx.translate(translate.x, translate.y);
            ctx.lineWidth = transition * 8;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            value.translate = translate;
            value.transition = transition;
        };
        if (!__classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_isInsideSector).call(this, this.onMouseMoveEvent, value)
            || !this.animations.contains(value.id, AnimationType.MouseLeave))
            this.animations.add(value.id, AnimationType.MouseLeave, {
                timer: Constants.Dates.minDate,
                duration: Constants.Animations.circular,
                backward: true,
                body: transition => {
                    translate(transition, AnimationType.MouseOver, value.transition < transition);
                }
            });
        else
            this.animations.add(value.id, AnimationType.MouseOver, {
                duration: Constants.Animations.circular,
                body: transition => {
                    translate(transition, AnimationType.MouseLeave, value.transition > transition);
                }
            });
    }
    let point2 = __classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_getPoint).call(this, __classPrivateFieldGet(this, _CircularRenderer_radius, "f"), angle);
    if (angle > 0) {
        ctx.save();
        if (value.current > 0) {
            let labelStartPoint = __classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_getPoint).call(this, __classPrivateFieldGet(this, _CircularRenderer_radius, "f") + 10, angle / 2), labelMidPoint = __classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_getPoint).call(this, __classPrivateFieldGet(this, _CircularRenderer_radius, "f") + 20, angle / 2);
            const dir = labelStartPoint.x > __classPrivateFieldGet(this, _CircularRenderer_center, "f").x ? 1 : -1;
            let endPoint = {
                x: labelMidPoint.x + 10 * dir,
                y: labelMidPoint.y
            };
            let isBusy = false;
            const textWidth = Helper.stringWidth(value.label), imageDataX = dir == 1 ? endPoint.x + 12 : endPoint.x - textWidth - 12, imageData = new Uint32Array(ctx.getImageData(imageDataX, endPoint.y - 12, textWidth + 12, 28).data.buffer);
            if (imageDataX < 0 || imageDataX + textWidth > this.canvas.width
                || endPoint.y - 12 < 0 || endPoint.y + 12 > this.canvas.height)
                isBusy = true;
            if (!isBusy)
                for (let i = 0; i < imageData.length; i++)
                    if (Canvas.isPixelBusy(imageData[i])) {
                        isBusy = true;
                        break;
                    }
            if (!isBusy) {
                ctx.beginPath();
                ctx.moveTo(labelStartPoint.x, labelStartPoint.y);
                ctx.quadraticCurveTo(labelMidPoint.x, labelMidPoint.y, endPoint.x, endPoint.y);
                let opacity = Math.round(255 * (value.current / value.value)).toString(16);
                if (opacity.length < 2)
                    opacity = 0 + opacity;
                ctx.strokeStyle = Theme.text + opacity;
                ctx.lineCap = 'butt';
                ctx.lineJoin = 'miter';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = Theme.text + opacity;
                TextStyles.circularLabel(ctx, dir == 1);
                ctx.fillText(value.label, endPoint.x + 8 * dir, endPoint.y + 4);
            }
        }
        ctx.restore();
        ctx.beginPath();
        if (!__classPrivateFieldGet(this, _CircularRenderer_isDonut, "f"))
            ctx.moveTo(__classPrivateFieldGet(this, _CircularRenderer_center, "f").x, __classPrivateFieldGet(this, _CircularRenderer_center, "f").y);
        ctx.lineTo(__classPrivateFieldGet(this, _CircularRenderer_startPoint, "f").x, __classPrivateFieldGet(this, _CircularRenderer_startPoint, "f").y);
        let localAccumulator = 0, localAngle = angle;
        while (localAngle > 0) {
            let currentAngle = localAngle - Math.PI / 6 > 0
                ? Math.PI / 6
                : localAngle;
            point2 = __classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_getPoint).call(this, __classPrivateFieldGet(this, _CircularRenderer_radius, "f"), localAccumulator + currentAngle);
            const tangentIntersectionAngle = Math.PI - currentAngle, lengthToTangentIntersection = __classPrivateFieldGet(this, _CircularRenderer_radius, "f") / Math.sin(tangentIntersectionAngle / 2), tangentIntersectionPoint = __classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_getPoint).call(this, lengthToTangentIntersection, localAccumulator + currentAngle / 2);
            ctx.quadraticCurveTo(tangentIntersectionPoint.x, tangentIntersectionPoint.y, point2.x, point2.y);
            localAccumulator += currentAngle;
            localAngle -= Math.PI / 6;
        }
        if (__classPrivateFieldGet(this, _CircularRenderer_isDonut, "f") || value.innerRadius != 0) {
            const innerRadius = __classPrivateFieldGet(this, _CircularRenderer_radius, "f") * (value.innerRadius / 100);
            const innerPoint2 = {
                x: point2.x - (((__classPrivateFieldGet(this, _CircularRenderer_radius, "f") - innerRadius) * (point2.x - __classPrivateFieldGet(this, _CircularRenderer_center, "f").x)) / __classPrivateFieldGet(this, _CircularRenderer_radius, "f")),
                y: point2.y - (((__classPrivateFieldGet(this, _CircularRenderer_radius, "f") - innerRadius) * (point2.y - __classPrivateFieldGet(this, _CircularRenderer_center, "f").y)) / __classPrivateFieldGet(this, _CircularRenderer_radius, "f"))
            };
            ctx.lineTo(innerPoint2.x, innerPoint2.y);
            localAngle = 0;
            localAccumulator = angle;
            while (localAngle < angle) {
                let currentAngle = localAngle + Math.PI / 6 < angle
                    ? Math.PI / 6
                    : angle - localAngle;
                point2 = __classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_getPoint).call(this, innerRadius, localAccumulator - currentAngle);
                const tangentIntersectionAngle = Math.PI - currentAngle, lengthToTangentIntersection = innerRadius / Math.sin(tangentIntersectionAngle / 2), tangentIntersectionPoint = __classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_getPoint).call(this, lengthToTangentIntersection, localAccumulator - currentAngle / 2);
                ctx.quadraticCurveTo(tangentIntersectionPoint.x, tangentIntersectionPoint.y, point2.x, point2.y);
                localAccumulator -= currentAngle;
                localAngle += Math.PI / 6;
            }
            point2 = __classPrivateFieldGet(this, _CircularRenderer_instances, "m", _CircularRenderer_getPoint).call(this, __classPrivateFieldGet(this, _CircularRenderer_radius, "f"), angle);
        }
        if (!this.animations.contains(value.id, AnimationType.Init)) {
            const changeColor = (transition, event) => {
                this.animations.reload(value.id, event);
                if (transition == 0)
                    return;
                let opacity = Math.round(255 - 95 * transition).toString(16);
                if (opacity.length < 2)
                    opacity = 0 + opacity;
                ctx.fillStyle = value.color + opacity;
                ctx.strokeStyle = value.color + opacity;
            };
            const anyHighlight = this.highlightItems.length != 0;
            if ((__classPrivateFieldGet(this, _CircularRenderer_currentHover, "f") && __classPrivateFieldGet(this, _CircularRenderer_currentHover, "f") != value.id)
                || (anyHighlight && !this.highlightItems.includes(value.id))) {
                this.animations.add(value.id, AnimationType.AnotherItemOver, {
                    duration: Constants.Animations.circular,
                    body: transition => {
                        changeColor(transition, AnimationType.AnotherItemLeave);
                    }
                });
            }
            else if (__classPrivateFieldGet(this, _CircularRenderer_currentHover, "f") == undefined || !anyHighlight) {
                this.animations.add(value.id, AnimationType.AnotherItemLeave, {
                    timer: Constants.Dates.minDate,
                    duration: Constants.Animations.circular,
                    backward: true,
                    body: transition => {
                        changeColor(transition, AnimationType.AnotherItemOver);
                    }
                });
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        __classPrivateFieldSet(this, _CircularRenderer_accumulator, __classPrivateFieldGet(this, _CircularRenderer_accumulator, "f") + angle, "f");
    }
    ctx.resetTransform();
    __classPrivateFieldSet(this, _CircularRenderer_startPoint, point2, "f");
}, _CircularRenderer_getPoint = function _CircularRenderer_getPoint(radius, angle) {
    return {
        x: __classPrivateFieldGet(this, _CircularRenderer_center, "f").x + radius * Math.cos(__classPrivateFieldGet(this, _CircularRenderer_accumulator, "f") + angle),
        y: __classPrivateFieldGet(this, _CircularRenderer_center, "f").y + radius * Math.sin(__classPrivateFieldGet(this, _CircularRenderer_accumulator, "f") + angle)
    };
}, _CircularRenderer_isInsideSector = function _CircularRenderer_isInsideSector(event, value) {
    const isAngle = (point) => {
        let a = Math.atan2(point.y - __classPrivateFieldGet(this, _CircularRenderer_center, "f").y, point.x - __classPrivateFieldGet(this, _CircularRenderer_center, "f").x);
        if (a < 0)
            a += Math.PI * 2;
        if (a < __classPrivateFieldGet(this, _CircularRenderer_startAngle, "f"))
            a = Math.PI * 2 - Math.abs(__classPrivateFieldGet(this, _CircularRenderer_startAngle, "f") - a) + __classPrivateFieldGet(this, _CircularRenderer_startAngle, "f");
        let index = __classPrivateFieldGet(this, _CircularRenderer_angles, "f").findIndex(o => o.id == value.id), sumBefore = __classPrivateFieldGet(this, _CircularRenderer_angles, "f")[index].sum;
        return !(this.dropdown?.isActive ?? false)
            && sumBefore <= a
            && sumBefore + __classPrivateFieldGet(this, _CircularRenderer_angles, "f")[index].value - a >= 0;
    };
    const isWithinRadius = (v) => {
        return v.x * v.x + v.y * v.y <= __classPrivateFieldGet(this, _CircularRenderer_radius, "f") * __classPrivateFieldGet(this, _CircularRenderer_radius, "f")
            && (!__classPrivateFieldGet(this, _CircularRenderer_isDonut, "f") || v.x * v.x + v.y * v.y
                >= __classPrivateFieldGet(this, _CircularRenderer_radius, "f") * (value.innerRadius / 100) * __classPrivateFieldGet(this, _CircularRenderer_radius, "f") * (value.innerRadius / 100));
    };
    const point = this.getMousePosition(event), inner = {
        x: point.x - __classPrivateFieldGet(this, _CircularRenderer_center, "f").x,
        y: point.y - __classPrivateFieldGet(this, _CircularRenderer_center, "f").y
    }, outer = {
        x: point.x - __classPrivateFieldGet(this, _CircularRenderer_center, "f").x - value.translate?.x,
        y: point.y - __classPrivateFieldGet(this, _CircularRenderer_center, "f").y - value.translate?.y
    };
    return isAngle(point) && (isWithinRadius(inner) || isWithinRadius(outer));
}, _CircularRenderer_drawEmpty = function _CircularRenderer_drawEmpty() {
    const ctx = Canvas.getContext(this.canvas);
    ctx.beginPath();
    ctx.arc(__classPrivateFieldGet(this, _CircularRenderer_center, "f").x, __classPrivateFieldGet(this, _CircularRenderer_center, "f").y, __classPrivateFieldGet(this, _CircularRenderer_radius, "f"), 0, 2 * Math.PI);
    ctx.strokeStyle = Theme.text;
    ctx.stroke();
    TextStyles.regular(ctx);
    ctx.fillText(TextResources.allDataIsHidden, __classPrivateFieldGet(this, _CircularRenderer_center, "f").x, __classPrivateFieldGet(this, _CircularRenderer_center, "f").y);
    requestAnimationFrame(this.render.bind(this));
}, _CircularRenderer_drawInnerTitle = function _CircularRenderer_drawInnerTitle() {
    if (__classPrivateFieldGet(this, _CircularRenderer_canRenderInnerTitle, "f")) {
        const ctx = Canvas.getContext(this.canvas);
        __classPrivateFieldGet(this, _CircularRenderer_innerTitleStyle, "f").call(this, ctx);
        ctx.fillText(this.data.innerTitle, __classPrivateFieldGet(this, _CircularRenderer_center, "f").x, __classPrivateFieldGet(this, _CircularRenderer_center, "f").y);
    }
}, _CircularRenderer_calculateSizes = function _CircularRenderer_calculateSizes() {
    const titleOffset = this.settings.title
        ? Constants.Values.titleOffset
        : 0;
    const shortSide = this.canvas.width > this.canvas.height - titleOffset * 2
        ? this.canvas.height - titleOffset * 2
        : this.canvas.width;
    __classPrivateFieldSet(this, _CircularRenderer_center, {
        x: this.canvas.width / 2,
        y: titleOffset + this.canvas.height / 2
    }, "f");
    __classPrivateFieldSet(this, _CircularRenderer_radius, shortSide / 3, "f");
    if (this.data.innerTitle != undefined && this.data.innerTitle != '') {
        __classPrivateFieldSet(this, _CircularRenderer_innerTitleStyle, TextStyles.large, "f");
        __classPrivateFieldSet(this, _CircularRenderer_canRenderInnerTitle, Helper.stringWidth(this.data.innerTitle, 16)
            < (this.data.innerRadius / 100) * __classPrivateFieldGet(this, _CircularRenderer_radius, "f") * 2, "f");
        if (!__classPrivateFieldGet(this, _CircularRenderer_canRenderInnerTitle, "f")) {
            __classPrivateFieldSet(this, _CircularRenderer_innerTitleStyle, TextStyles.regular, "f");
            __classPrivateFieldSet(this, _CircularRenderer_canRenderInnerTitle, Helper.stringWidth(this.data.innerTitle, 14)
                < (this.data.innerRadius / 100) * __classPrivateFieldGet(this, _CircularRenderer_radius, "f") * 2, "f");
        }
        if (!__classPrivateFieldGet(this, _CircularRenderer_canRenderInnerTitle, "f"))
            console.warn(`Inner title is declared, but can't be rendered`);
    }
    __classPrivateFieldSet(this, _CircularRenderer_animationOffset, __classPrivateFieldGet(this, _CircularRenderer_radius, "f") * .1, "f");
};
var _GaugeRenderer_instances, _GaugeRenderer_radius, _GaugeRenderer_center, _GaugeRenderer_draw, _GaugeRenderer_isInsideSector, _GaugeRenderer_calculateSizes;
class GaugeRenderer extends Renderer {
    constructor(chart) {
        super(chart);
        _GaugeRenderer_instances.add(this);
        _GaugeRenderer_radius.set(this, void 0);
        _GaugeRenderer_center.set(this, void 0);
        this.settings.enableLegend = false;
    }
    render() {
        super.render();
        __classPrivateFieldGet(this, _GaugeRenderer_instances, "m", _GaugeRenderer_draw).call(this);
        const value = this.data.values[0];
        this.tooltip.render(__classPrivateFieldGet(this, _GaugeRenderer_instances, "m", _GaugeRenderer_isInsideSector).call(this, this.onMouseMoveEvent, value) && !this.dropdown?.isActive, this.onMouseMoveEvent, [
            new TooltipValue(`${value?.label}: ${Formatter.number(value?.current)}`)
        ], value);
        if (!this.isDestroy)
            requestAnimationFrame(this.render.bind(this));
        this.state = RenderState.Idle;
        super.renderDropdown();
    }
    refresh() {
        super.refresh();
    }
    resize() {
        super.resize();
        this.initAnimations();
        __classPrivateFieldGet(this, _GaugeRenderer_instances, "m", _GaugeRenderer_calculateSizes).call(this);
    }
    prepareSettings() {
        super.prepareSettings();
        for (let item of this.data.values) {
            item.disabled = !item.value;
            item.value ??= 0;
        }
        if (this.data.values.length > 0 && this.data.values[0].value > this.data.max)
            this.data.values[0].value = this.data.max;
    }
    initDropdown() {
        super.initDropdown();
        this.dropdown = new Dropdown(this.canvas, {
            x: -10,
            y: 10,
            text: TextResources.menu,
            items: [
                {
                    text: TextResources.exportPNG,
                    action: () => {
                        Export.asPng(this.canvas, this.settings.title);
                    }
                }
            ]
        });
    }
}
_GaugeRenderer_radius = new WeakMap(), _GaugeRenderer_center = new WeakMap(), _GaugeRenderer_instances = new WeakSet(), _GaugeRenderer_draw = function _GaugeRenderer_draw() {
    const ctx = Canvas.getContext(this.canvas);
    const value = this.data.values[0] ?? { id: Helper.guid() };
    if (this.state == RenderState.Init || this.animations.contains(value.id, AnimationType.Init))
        this.animations.add(value.id, AnimationType.Init, {
            duration: 450,
            continuous: true,
            body: transition => {
                value.current = value.value * transition;
            }
        });
    ctx.beginPath();
    ctx.strokeStyle = value.color;
    ctx.lineCap = 'round';
    ctx.lineWidth = 40;
    const piece = value.current / this.data.max, angle = (isNaN(piece) ? 1 : piece) * Math.PI;
    if (value.value) {
        ctx.arc(__classPrivateFieldGet(this, _GaugeRenderer_center, "f").x, __classPrivateFieldGet(this, _GaugeRenderer_center, "f").y, __classPrivateFieldGet(this, _GaugeRenderer_radius, "f"), Math.PI, angle - Math.PI);
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.lineCap = 'square';
    let localAccumulator = 0, localAngle = Math.PI;
    while (localAngle >= 0) {
        let currentAngle = localAngle - Math.PI / 10 > 0
            ? Math.PI / 10
            : localAngle;
        const getPoint = (offset) => {
            return {
                x: __classPrivateFieldGet(this, _GaugeRenderer_center, "f").x + (__classPrivateFieldGet(this, _GaugeRenderer_radius, "f") + offset) * Math.cos(Math.PI + localAccumulator),
                y: __classPrivateFieldGet(this, _GaugeRenderer_center, "f").y + (__classPrivateFieldGet(this, _GaugeRenderer_radius, "f") + offset) * Math.sin(Math.PI + localAccumulator)
            };
        };
        let point1 = getPoint(50), point2 = getPoint(90), point3 = getPoint(115);
        const opacity = Math.PI - localAngle > angle ? '66' : 'ff';
        ctx.moveTo(point1.x, point1.y);
        ctx.lineTo(point2.x, point2.y);
        ctx.strokeStyle = Theme.text + opacity;
        ctx.stroke();
        TextStyles.regular(ctx);
        ctx.fillStyle = Theme.text + opacity;
        ctx.fillText((this.data.max - localAngle / Math.PI * this.data.max).toString(), point3.x, point3.y);
        localAccumulator += currentAngle;
        localAngle -= Math.PI / 10;
    }
}, _GaugeRenderer_isInsideSector = function _GaugeRenderer_isInsideSector(event, value) {
    if (!event)
        return false;
    const isAngle = (point) => {
        let a = Math.atan2(point.y - __classPrivateFieldGet(this, _GaugeRenderer_center, "f").y, point.x - __classPrivateFieldGet(this, _GaugeRenderer_center, "f").x);
        if (a < 0)
            a += Math.PI * 2;
        const piece = value.current / this.data.max, angle = (isNaN(piece) ? 1 : piece) * Math.PI;
        return a > Math.PI && Math.PI + angle >= a;
    };
    const isWithinRadius = (v) => {
        const outerRadius = __classPrivateFieldGet(this, _GaugeRenderer_radius, "f") + 20, innerRadius = __classPrivateFieldGet(this, _GaugeRenderer_radius, "f") - 20;
        return v.x * v.x + v.y * v.y <= outerRadius * outerRadius
            && v.x * v.x + v.y * v.y >= innerRadius * innerRadius;
    };
    const point = this.getMousePosition(event), inner = {
        x: point.x - __classPrivateFieldGet(this, _GaugeRenderer_center, "f").x,
        y: point.y - __classPrivateFieldGet(this, _GaugeRenderer_center, "f").y
    };
    return !(this.dropdown?.isActive ?? false)
        && isAngle(point)
        && isWithinRadius(inner);
}, _GaugeRenderer_calculateSizes = function _GaugeRenderer_calculateSizes() {
    const longSide = this.canvas.width < this.canvas.height
        ? this.canvas.height - 250
        : this.canvas.width;
    __classPrivateFieldSet(this, _GaugeRenderer_radius, longSide / 3, "f");
    __classPrivateFieldSet(this, _GaugeRenderer_center, {
        x: this.canvas.width / 2,
        y: this.canvas.height - __classPrivateFieldGet(this, _GaugeRenderer_radius, "f") / 5
    }, "f");
};
var _PlotRenderer_instances, _PlotRenderer_x, _PlotRenderer_y, _PlotRenderer_paddings, _PlotRenderer_tooltipX, _PlotRenderer_tooltipY, _PlotRenderer_labelsX, _PlotRenderer_labelsY, _PlotRenderer_allValuesX, _PlotRenderer_allValuesY, _PlotRenderer_base, _PlotRenderer_backLines, _PlotRenderer_yAxisStep, _PlotRenderer_plot, _PlotRenderer_hoverX, _PlotRenderer_isOnX, _PlotRenderer_isInArea, _PlotRenderer_renderBase, _PlotRenderer_renderBackLines, _PlotRenderer_calculateSizes;
class PlotRenderer extends Renderer {
    constructor(chart) {
        super(chart);
        _PlotRenderer_instances.add(this);
        _PlotRenderer_x.set(this, void 0);
        _PlotRenderer_y.set(this, void 0);
        _PlotRenderer_paddings.set(this, void 0);
        _PlotRenderer_tooltipX.set(this, void 0);
        _PlotRenderer_tooltipY.set(this, void 0);
        _PlotRenderer_labelsX.set(this, void 0);
        _PlotRenderer_labelsY.set(this, void 0);
        _PlotRenderer_allValuesX.set(this, void 0);
        _PlotRenderer_allValuesY.set(this, void 0);
        _PlotRenderer_base.set(this, void 0);
        _PlotRenderer_backLines.set(this, void 0);
        _PlotRenderer_yAxisStep.set(this, void 0);
        _PlotRenderer_plot.set(this, void 0);
        _PlotRenderer_hoverX.set(this, void 0);
        this.data.values = this.data.values.map(v => new PlotSeries(v));
        if (this.data.values.filter(v => v.type == PlotType.Bar).length > 0) {
            for (let series of this.data.values) {
                for (let item of series.values) {
                    const x = item.x;
                    item['x'] = item.y;
                    item['y'] = x;
                }
                series.values.sort((a, b) => b.x > a.x ? 1 : -1);
            }
        }
        __classPrivateFieldSet(this, _PlotRenderer_paddings, {
            top: 30,
            right: 40,
            bottom: 50,
            left: 80
        }, "f");
        if (this.settings.title)
            __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top += Constants.Values.titleOffset;
        this.tooltip = new Tooltip(this.canvas, this.settings);
        __classPrivateFieldSet(this, _PlotRenderer_labelsX, new Map(), "f");
        __classPrivateFieldSet(this, _PlotRenderer_labelsY, new Map(), "f");
    }
    render() {
        super.render();
        let tooltipLines = [
            new TooltipValue(__classPrivateFieldGet(this, _PlotRenderer_labelsX, "f").get(Math.round(__classPrivateFieldGet(this, _PlotRenderer_tooltipX, "f")))
                ?? __classPrivateFieldGet(this, _PlotRenderer_labelsY, "f").get(Math.round(__classPrivateFieldGet(this, _PlotRenderer_tooltipY, "f"))))
        ];
        const ctx = Canvas.getContext(this.canvas);
        TextStyles.regular(ctx);
        ctx.lineJoin = 'round';
        const axisLineHoverColor = Theme.lineActive;
        __classPrivateFieldGet(this, _PlotRenderer_instances, "m", _PlotRenderer_renderBackLines).call(this);
        __classPrivateFieldGet(this, _PlotRenderer_instances, "m", _PlotRenderer_renderBase).call(this, true);
        let x = 0, y = 0, yValue = 0, yHeight = 0, columnWidth = 0;
        let columnsIndex = 0, columnsCount = this.data.values.filter(s => s.type == PlotType.Column).length;
        let barsIndex = 0, barsCount = this.data.values.filter(s => s.type == PlotType.Bar).length, barHeight = __classPrivateFieldGet(this, _PlotRenderer_y, "f").step / (2 * barsCount);
        let stackingAccumulator = [];
        for (let i = 0; i < __classPrivateFieldGet(this, _PlotRenderer_allValuesY, "f").length; i++)
            stackingAccumulator.push(0);
        for (const series of this.data.values.filter(s => !s.disabled)) {
            ctx.beginPath();
            ctx.strokeStyle = series.color;
            ctx.fillStyle = series.color;
            ctx.lineWidth = series.width;
            ctx.lineCap = 'round';
            const anyHighlight = this.highlightItems.length != 0;
            if (!this.animations.contains(series.id, AnimationType.Init)) {
                const changeColor = (transition, event) => {
                    this.animations.reload(series.id, event);
                    if (transition == 0)
                        return;
                    let opacity = Math.round(255 - 95 * transition).toString(16);
                    if (opacity.length < 2)
                        opacity = 0 + opacity;
                    ctx.fillStyle = series.color + opacity;
                    ctx.strokeStyle = series.color + opacity;
                };
                if (anyHighlight && !this.highlightItems.includes(series.id)) {
                    this.animations.add(series.id, AnimationType.AnotherItemOver, {
                        duration: Constants.Animations.circular,
                        body: transition => {
                            changeColor(transition, AnimationType.AnotherItemLeave);
                        }
                    });
                }
                else if (!anyHighlight) {
                    this.animations.add(series.id, AnimationType.AnotherItemLeave, {
                        timer: Constants.Dates.minDate,
                        duration: Constants.Animations.circular,
                        backward: true,
                        body: transition => {
                            changeColor(transition, AnimationType.AnotherItemOver);
                        }
                    });
                }
            }
            switch (series.lineType) {
                case LineType.Dash:
                    ctx.setLineDash([series.width * 3, series.width * 2]);
                    break;
                case LineType.Dotted:
                    ctx.setLineDash([series.width, series.width]);
                    break;
                case LineType.Solid:
                default:
                    break;
            }
            for (const value of series.values) {
                let index = series.values.indexOf(value), xIndex = __classPrivateFieldGet(this, _PlotRenderer_allValuesX, "f").indexOf(this.data.xType == PlotAxisType.Date ? value.x.toString() : value.x), yIndex = __classPrivateFieldGet(this, _PlotRenderer_allValuesY, "f").indexOf(value.y);
                const getTooltipValue = () => {
                    return {
                        x: value.x
                            ? this.data.xType == PlotAxisType.Date
                                ? __classPrivateFieldGet(this, _PlotRenderer_allValuesX, "f")[xIndex]
                                : Formatter.number(__classPrivateFieldGet(this, _PlotRenderer_allValuesX, "f")[xIndex])
                            : '0',
                        y: value.y
                            ? Formatter.number(__classPrivateFieldGet(this, _PlotRenderer_allValuesY, "f")[yIndex])
                            : '0'
                    };
                };
                x = __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left;
                if (series.type != PlotType.Bar)
                    x += xIndex * __classPrivateFieldGet(this, _PlotRenderer_x, "f").step;
                if (series.type == PlotType.Line)
                    x -= __classPrivateFieldGet(this, _PlotRenderer_x, "f").step / 2 - __classPrivateFieldGet(this, _PlotRenderer_x, "f").step;
                switch (series.type) {
                    case PlotType.Line:
                        y = __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top + __classPrivateFieldGet(this, _PlotRenderer_plot, "f").height - value.y / __classPrivateFieldGet(this, _PlotRenderer_y, "f").unit * __classPrivateFieldGet(this, _PlotRenderer_y, "f").step
                            - Math.abs(__classPrivateFieldGet(this, _PlotRenderer_y, "f").min / __classPrivateFieldGet(this, _PlotRenderer_y, "f").unit * __classPrivateFieldGet(this, _PlotRenderer_y, "f").step);
                        const pointDuration = 1500 / series.values.length * 1.2;
                        if (this.state == RenderState.Init || this.animations.contains(value.id, AnimationType.Init)) {
                            this.animations.add(value.id, AnimationType.Init, {
                                timer: new Date(Date.now()).addMilliseconds(pointDuration * (index - 1)),
                                duration: pointDuration,
                                continuous: true,
                                body: transition => {
                                    if (index == 0)
                                        return;
                                    x = __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left + xIndex * __classPrivateFieldGet(this, _PlotRenderer_x, "f").step - __classPrivateFieldGet(this, _PlotRenderer_x, "f").step / 2;
                                    y = __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top + __classPrivateFieldGet(this, _PlotRenderer_plot, "f").height - value.y / __classPrivateFieldGet(this, _PlotRenderer_y, "f").unit * __classPrivateFieldGet(this, _PlotRenderer_y, "f").step
                                        - Math.abs(__classPrivateFieldGet(this, _PlotRenderer_y, "f").min / __classPrivateFieldGet(this, _PlotRenderer_y, "f").unit * __classPrivateFieldGet(this, _PlotRenderer_y, "f").step);
                                    const next = series.values[index - 1];
                                    let prevValue = {
                                        x: __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left + xIndex * __classPrivateFieldGet(this, _PlotRenderer_x, "f").step - __classPrivateFieldGet(this, _PlotRenderer_x, "f").step / 2,
                                        y: __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top + __classPrivateFieldGet(this, _PlotRenderer_plot, "f").height - next.y / __classPrivateFieldGet(this, _PlotRenderer_y, "f").unit * __classPrivateFieldGet(this, _PlotRenderer_y, "f").step
                                            - Math.abs(__classPrivateFieldGet(this, _PlotRenderer_y, "f").min / __classPrivateFieldGet(this, _PlotRenderer_y, "f").unit * __classPrivateFieldGet(this, _PlotRenderer_y, "f").step)
                                    };
                                    const endPointX = prevValue.x + (__classPrivateFieldGet(this, _PlotRenderer_x, "f").step + (x - prevValue.x)) * transition, endPointY = prevValue.y + (y - prevValue.y) * transition;
                                    if (prevValue.x != endPointX && prevValue.y != endPointY) {
                                        ctx.moveTo(prevValue.x, prevValue.y);
                                        ctx.lineTo(endPointX, endPointY);
                                    }
                                }
                            });
                        }
                        else {
                            ctx.lineTo(x, y);
                            if (__classPrivateFieldGet(this, _PlotRenderer_instances, "m", _PlotRenderer_isOnX).call(this, x)) {
                                __classPrivateFieldSet(this, _PlotRenderer_hoverX, {
                                    x: x,
                                    y: y,
                                    index: index,
                                    data: value.data,
                                    series: series
                                }, "f");
                                tooltipLines.push(new TooltipValue(`${series.label}: ${getTooltipValue().y}`, series.color));
                                __classPrivateFieldSet(this, _PlotRenderer_tooltipX, x - __classPrivateFieldGet(this, _PlotRenderer_x, "f").step / 2, "f");
                            }
                        }
                        break;
                    case PlotType.AttentionLine:
                        yValue = this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom - value.y / __classPrivateFieldGet(this, _PlotRenderer_y, "f").unit * __classPrivateFieldGet(this, _PlotRenderer_y, "f").step;
                        ctx.moveTo(__classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left, yValue);
                        if (this.state == RenderState.Init || this.animations.contains(value.id, AnimationType.Init))
                            this.animations.add(value.id, AnimationType.Init, {
                                duration: 1500,
                                continuous: true,
                                body: transition => {
                                    ctx.lineTo(__classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left + (this.canvas.width - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").right) * transition, this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom - value.y / __classPrivateFieldGet(this, _PlotRenderer_y, "f").unit * __classPrivateFieldGet(this, _PlotRenderer_y, "f").step);
                                }
                            });
                        else
                            ctx.lineTo(this.canvas.width - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").right, yValue);
                        break;
                    case PlotType.Column:
                        yValue = value.y > this.data.yMax ? this.data.yMax : value.y;
                        y = __classPrivateFieldGet(this, _PlotRenderer_plot, "f").height * yValue / __classPrivateFieldGet(this, _PlotRenderer_y, "f").max;
                        if (y < __classPrivateFieldGet(this, _PlotRenderer_y, "f").minStep)
                            y = __classPrivateFieldGet(this, _PlotRenderer_y, "f").minStep;
                        columnWidth = __classPrivateFieldGet(this, _PlotRenderer_x, "f").step * (series.width ? series.width / 100 : .5) / columnsCount;
                        if (this.state == RenderState.Init || this.animations.contains(value.id + columnsIndex, AnimationType.Init)) {
                            this.animations.add(value.id + columnsIndex, AnimationType.Init, {
                                duration: 800,
                                continuous: true,
                                body: transition => {
                                    yValue = value.y > this.data.yMax ? this.data.yMax : value.y;
                                    x = __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left + xIndex * __classPrivateFieldGet(this, _PlotRenderer_x, "f").step;
                                    y = __classPrivateFieldGet(this, _PlotRenderer_plot, "f").height * yValue / __classPrivateFieldGet(this, _PlotRenderer_y, "f").max * transition;
                                    if (y < __classPrivateFieldGet(this, _PlotRenderer_y, "f").minStep)
                                        y = __classPrivateFieldGet(this, _PlotRenderer_y, "f").minStep * transition;
                                    columnsIndex = this.data.values.filter(s => s.type == PlotType.Column)
                                        .indexOf(series);
                                    ctx.fillRect(x + columnsIndex * columnWidth + (__classPrivateFieldGet(this, _PlotRenderer_x, "f").step - columnsCount * columnWidth) / 2, this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom - y, columnWidth, y);
                                }
                            });
                        }
                        else {
                            if (!anyHighlight) {
                                if (__classPrivateFieldGet(this, _PlotRenderer_instances, "m", _PlotRenderer_isInArea).call(this, x + columnsIndex * columnWidth + (__classPrivateFieldGet(this, _PlotRenderer_x, "f").step - columnsCount * columnWidth) / 2, this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom - y, columnWidth, y)
                                    && (this.contextMenu?.isActive == undefined
                                        || this.contextMenu?.isActive == false)) {
                                    __classPrivateFieldSet(this, _PlotRenderer_hoverX, {
                                        x: x,
                                        y: y,
                                        index: index,
                                        data: value.data,
                                        series: series
                                    }, "f");
                                    tooltipLines.push(new TooltipValue(`${series.label}: ${getTooltipValue().y}`, series.color));
                                    __classPrivateFieldSet(this, _PlotRenderer_tooltipX, x, "f");
                                    ctx.fillStyle += '88';
                                }
                                else {
                                    ctx.fillStyle = series.color;
                                }
                            }
                            ctx.fillRect(x + columnsIndex * columnWidth + (__classPrivateFieldGet(this, _PlotRenderer_x, "f").step - columnsCount * columnWidth) / 2, this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom - y, columnWidth, y);
                        }
                        break;
                    case PlotType.Bar:
                        y = __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top + yIndex * __classPrivateFieldGet(this, _PlotRenderer_y, "f").step + __classPrivateFieldGet(this, _PlotRenderer_y, "f").step / 2;
                        const seriesHeight = series.width ?? barHeight;
                        if (this.state == RenderState.Init || this.animations.contains(value.id + barsIndex, AnimationType.Init)) {
                            this.animations.add(value.id + barsIndex, AnimationType.Init, {
                                duration: 800,
                                continuous: true,
                                body: transition => {
                                    y = __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top + yIndex * __classPrivateFieldGet(this, _PlotRenderer_y, "f").step + __classPrivateFieldGet(this, _PlotRenderer_y, "f").step / 2;
                                    barsIndex = this.data.values.filter(s => s.type == PlotType.Bar)
                                        .indexOf(series);
                                    ctx.fillRect(x, y - __classPrivateFieldGet(this, _PlotRenderer_y, "f").step / 4 + barsIndex * seriesHeight, value.x / __classPrivateFieldGet(this, _PlotRenderer_x, "f").unit * __classPrivateFieldGet(this, _PlotRenderer_x, "f").step * transition, seriesHeight);
                                }
                            });
                        }
                        else {
                            if (!anyHighlight) {
                                if (__classPrivateFieldGet(this, _PlotRenderer_instances, "m", _PlotRenderer_isInArea).call(this, x, y - __classPrivateFieldGet(this, _PlotRenderer_y, "f").step / 4 + barsIndex * seriesHeight, value.x / __classPrivateFieldGet(this, _PlotRenderer_x, "f").unit * __classPrivateFieldGet(this, _PlotRenderer_x, "f").step, seriesHeight)) {
                                    __classPrivateFieldSet(this, _PlotRenderer_hoverX, {
                                        x: x,
                                        y: y,
                                        index: index,
                                        data: value.data,
                                        series: series
                                    }, "f");
                                    ctx.fillStyle += '88';
                                    tooltipLines.push(new TooltipValue(`${series.label}: ${getTooltipValue().x}`, series.color));
                                    __classPrivateFieldSet(this, _PlotRenderer_tooltipY, y - __classPrivateFieldGet(this, _PlotRenderer_y, "f").step / 2, "f");
                                }
                                else {
                                    ctx.fillStyle = series.color;
                                }
                            }
                            ctx.fillRect(x, y - __classPrivateFieldGet(this, _PlotRenderer_y, "f").step / 4 + barsIndex * seriesHeight, value.x / __classPrivateFieldGet(this, _PlotRenderer_x, "f").unit * __classPrivateFieldGet(this, _PlotRenderer_x, "f").step, seriesHeight);
                        }
                        break;
                    case PlotType.StackingColumn:
                        y = this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom - value.y / __classPrivateFieldGet(this, _PlotRenderer_y, "f").unit * __classPrivateFieldGet(this, _PlotRenderer_y, "f").step;
                        columnWidth = __classPrivateFieldGet(this, _PlotRenderer_x, "f").step * (series.width ? series.width / 100 : .5);
                        if (this.state == RenderState.Init || this.animations.contains(value.id + index, AnimationType.Init)) {
                            this.animations.add(value.id + index, AnimationType.Init, {
                                duration: 800,
                                continuous: true,
                                body: transition => {
                                    columnsIndex = this.data.values.filter(s => s.type == PlotType.StackingColumn && s.values.filter(v => v.x == value.x).length > 0)
                                        .indexOf(series);
                                    x = __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left + xIndex * __classPrivateFieldGet(this, _PlotRenderer_x, "f").step;
                                    y = this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom - value.y / __classPrivateFieldGet(this, _PlotRenderer_y, "f").unit * __classPrivateFieldGet(this, _PlotRenderer_y, "f").step;
                                    if (columnsIndex == 0)
                                        stackingAccumulator[xIndex] = 0;
                                    let offset = stackingAccumulator[xIndex] != undefined
                                        ? stackingAccumulator[xIndex]
                                        : 0;
                                    yValue = this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom + offset;
                                    yHeight = (y - this.canvas.height + __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom) * transition;
                                    if (yValue > __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top) {
                                        if (yValue + yHeight < __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top)
                                            yHeight -= yValue + yHeight - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top;
                                        ctx.fillRect(x + (__classPrivateFieldGet(this, _PlotRenderer_x, "f").step - columnWidth) / 2, yValue, columnWidth, yHeight);
                                    }
                                    stackingAccumulator[xIndex] += (y - this.canvas.height + __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom) * transition;
                                }
                            });
                        }
                        else {
                            if (columnsIndex == 0)
                                stackingAccumulator[xIndex] = 0;
                            let offset = stackingAccumulator[xIndex] != undefined
                                ? stackingAccumulator[xIndex]
                                : 0;
                            yValue = this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom + offset;
                            yHeight = y - this.canvas.height + __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom;
                            if (yValue > __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top) {
                                if (yValue + yHeight < __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top)
                                    yHeight -= yValue + yHeight - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top;
                                if (!anyHighlight) {
                                    if (__classPrivateFieldGet(this, _PlotRenderer_instances, "m", _PlotRenderer_isInArea).call(this, x + (__classPrivateFieldGet(this, _PlotRenderer_x, "f").step - columnWidth) / 2, yValue + yHeight, columnWidth, Math.abs(yHeight))) {
                                        __classPrivateFieldSet(this, _PlotRenderer_hoverX, {
                                            x: x,
                                            y: y,
                                            index: xIndex,
                                            data: value.data,
                                            series: series
                                        }, "f");
                                        tooltipLines.push(new TooltipValue(`${series.label}: ${getTooltipValue().y}`, series.color));
                                        __classPrivateFieldSet(this, _PlotRenderer_tooltipX, x, "f");
                                        ctx.fillStyle += '88';
                                    }
                                    else {
                                        ctx.fillStyle = series.color;
                                    }
                                }
                                ctx.fillRect(x + (__classPrivateFieldGet(this, _PlotRenderer_x, "f").step - columnWidth) / 2, yValue, columnWidth, yHeight);
                            }
                            stackingAccumulator[xIndex] += (y - this.canvas.height + __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom);
                        }
                        break;
                }
            }
            ctx.setLineDash([]);
            switch (series.type) {
                case PlotType.Line:
                    ctx.stroke();
                    if (__classPrivateFieldGet(this, _PlotRenderer_hoverX, "f") && __classPrivateFieldGet(this, _PlotRenderer_hoverX, "f").series == series) {
                        const mouse = this.getMousePosition(this.onMouseMoveEvent);
                        if (Math.abs(mouse.x - __classPrivateFieldGet(this, _PlotRenderer_hoverX, "f").x) < 25
                            && Math.abs(mouse.y - __classPrivateFieldGet(this, _PlotRenderer_hoverX, "f").y) < 25) {
                            ctx.beginPath();
                            ctx.lineWidth = 1;
                            ctx.strokeStyle = axisLineHoverColor;
                            ctx.moveTo(__classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left, __classPrivateFieldGet(this, _PlotRenderer_hoverX, "f").y);
                            ctx.lineTo(this.canvas.width - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").right, __classPrivateFieldGet(this, _PlotRenderer_hoverX, "f").y);
                            ctx.stroke();
                        }
                        let radius = Math.round(series.width * 1.1);
                        if (radius < 5)
                            radius = 5;
                        ctx.beginPath();
                        ctx.arc(__classPrivateFieldGet(this, _PlotRenderer_hoverX, "f").x, __classPrivateFieldGet(this, _PlotRenderer_hoverX, "f").y, radius, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.lineWidth = Math.ceil(radius / 2);
                        ctx.strokeStyle = Helper.adjustColor(series.color, 50);
                        ctx.stroke();
                    }
                    break;
                case PlotType.AttentionLine:
                    ctx.stroke();
                    TextStyles.regular(ctx);
                    ctx.fillText(series.label, __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left + (this.canvas.width - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").right) / 2, this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom - series.values[0].y / __classPrivateFieldGet(this, _PlotRenderer_y, "f").unit * __classPrivateFieldGet(this, _PlotRenderer_y, "f").step + 16);
                    break;
                case PlotType.Column:
                case PlotType.StackingColumn:
                    if (__classPrivateFieldGet(this, _PlotRenderer_hoverX, "f")) {
                        let offset = stackingAccumulator[__classPrivateFieldGet(this, _PlotRenderer_hoverX, "f").index] != undefined
                            ? stackingAccumulator[__classPrivateFieldGet(this, _PlotRenderer_hoverX, "f").index]
                            : 0;
                        if (this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom + offset > __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top) {
                            ctx.lineWidth = 1;
                            ctx.strokeStyle = axisLineHoverColor;
                            ctx.moveTo(__classPrivateFieldGet(this, _PlotRenderer_tooltipX, "f") + __classPrivateFieldGet(this, _PlotRenderer_x, "f").step / 2, __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top);
                            ctx.lineTo(__classPrivateFieldGet(this, _PlotRenderer_tooltipX, "f") + __classPrivateFieldGet(this, _PlotRenderer_x, "f").step / 2, this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom + offset);
                            ctx.stroke();
                        }
                    }
                    columnsIndex++;
                    break;
                case PlotType.Bar:
                    if (__classPrivateFieldGet(this, _PlotRenderer_hoverX, "f")) {
                        ctx.lineWidth = 1;
                        ctx.strokeStyle = axisLineHoverColor;
                        ctx.moveTo(__classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left, __classPrivateFieldGet(this, _PlotRenderer_tooltipY, "f") + __classPrivateFieldGet(this, _PlotRenderer_y, "f").step / 2);
                        ctx.lineTo(this.canvas.width - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").right, __classPrivateFieldGet(this, _PlotRenderer_tooltipY, "f") + __classPrivateFieldGet(this, _PlotRenderer_y, "f").step / 2);
                        ctx.stroke();
                    }
                    barsIndex++;
                    break;
            }
        }
        __classPrivateFieldGet(this, _PlotRenderer_instances, "m", _PlotRenderer_renderBase).call(this);
        this.tooltip.render(tooltipLines.length > 1 && !this.dropdown?.isActive, this.onMouseMoveEvent, tooltipLines, __classPrivateFieldGet(this, _PlotRenderer_hoverX, "f")
            ? __classPrivateFieldGet(this, _PlotRenderer_hoverX, "f").series.values[__classPrivateFieldGet(this, _PlotRenderer_hoverX, "f").index]
            : undefined);
        if (!this.isDestroy)
            requestAnimationFrame(this.render.bind(this));
        this.state = RenderState.Idle;
        super.renderDropdown();
        if (this.onContextMenuEvent && !__classPrivateFieldGet(this, _PlotRenderer_hoverX, "f"))
            this.onContextMenuEvent = undefined;
        if (__classPrivateFieldGet(this, _PlotRenderer_hoverX, "f")
            && (this.renderContextMenu(__classPrivateFieldGet(this, _PlotRenderer_hoverX, "f").data)
                || !this.onContextMenuEvent))
            __classPrivateFieldSet(this, _PlotRenderer_hoverX, undefined, "f");
    }
    refresh() {
        super.refresh();
    }
    resize() {
        super.resize();
        __classPrivateFieldSet(this, _PlotRenderer_base, undefined, "f");
        __classPrivateFieldGet(this, _PlotRenderer_instances, "m", _PlotRenderer_calculateSizes).call(this);
    }
    prepareSettings() {
        super.prepareSettings();
        for (let item of this.data.values) {
            item.disabled = !item.values;
            item.type ??= PlotType.Line;
            for (let it of item.values) {
                it.id = Helper.guid();
                if (this.data.xType == PlotAxisType.Date) {
                    if (Helper.isISOString(it.x))
                        it.x = new Date(it.x);
                    else
                        console.warn(`${it.x} is not a date in ISO format.`);
                }
            }
        }
    }
    initDropdown() {
        super.initDropdown();
        this.dropdown = new Dropdown(this.canvas, {
            x: -10,
            y: 10,
            text: TextResources.menu,
            items: [
                {
                    text: TextResources.exportPNG,
                    action: () => {
                        Export.asPng(this.canvas, this.settings.title);
                    }
                },
                {
                    text: TextResources.exportCSV,
                    action: () => {
                        Export.asCsv(Decomposition.toTable(PlotData.getRows(this.data)), this.settings.title);
                    }
                },
                {
                    isDivider: true
                },
                {
                    text: TextResources.decomposeToTable,
                    action: () => {
                        new Modal(Decomposition.toTable(PlotData.getRows(this.data))).open();
                    }
                }
            ]
        });
    }
}
_PlotRenderer_x = new WeakMap(), _PlotRenderer_y = new WeakMap(), _PlotRenderer_paddings = new WeakMap(), _PlotRenderer_tooltipX = new WeakMap(), _PlotRenderer_tooltipY = new WeakMap(), _PlotRenderer_labelsX = new WeakMap(), _PlotRenderer_labelsY = new WeakMap(), _PlotRenderer_allValuesX = new WeakMap(), _PlotRenderer_allValuesY = new WeakMap(), _PlotRenderer_base = new WeakMap(), _PlotRenderer_backLines = new WeakMap(), _PlotRenderer_yAxisStep = new WeakMap(), _PlotRenderer_plot = new WeakMap(), _PlotRenderer_hoverX = new WeakMap(), _PlotRenderer_instances = new WeakSet(), _PlotRenderer_isOnX = function _PlotRenderer_isOnX(x) {
    if (!this.onMouseMoveEvent)
        return false;
    const mouse = this.getMousePosition(this.onMouseMoveEvent);
    return !(this.dropdown?.isActive ?? false)
        && x - __classPrivateFieldGet(this, _PlotRenderer_x, "f").step / 2 <= mouse.x && mouse.x < x + __classPrivateFieldGet(this, _PlotRenderer_x, "f").step / 2
        && __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top <= mouse.y && mouse.y <= this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom
        && __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left < mouse.x;
}, _PlotRenderer_isInArea = function _PlotRenderer_isInArea(x, y, w, h) {
    if (!this.onMouseMoveEvent)
        return false;
    const mouse = this.getMousePosition(this.onMouseMoveEvent);
    return !(this.dropdown?.isActive ?? false)
        && mouse.x >= x && mouse.x <= x + w
        && mouse.y >= y && mouse.y <= y + h;
}, _PlotRenderer_renderBase = function _PlotRenderer_renderBase(skip = false) {
    if (__classPrivateFieldGet(this, _PlotRenderer_base, "f") && skip)
        return;
    if (this.data.simple)
        return;
    const ctx = Canvas.getContext(this.canvas);
    if (skip)
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (__classPrivateFieldGet(this, _PlotRenderer_base, "f")) {
        ctx.drawImage(__classPrivateFieldGet(this, _PlotRenderer_base, "f"), 0, 0);
        return;
    }
    if (!skip)
        return;
    const axisLabelOffset = 12;
    ctx.fillStyle = Theme.canvasBackground;
    ctx.fillRect(0, 0, __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left, this.canvas.height);
    ctx.fillRect(0, 0, this.canvas.width, __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top);
    ctx.fillRect(this.canvas.width - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").right, 0, this.canvas.width, this.canvas.height);
    ctx.fillRect(0, this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom, this.canvas.width, this.canvas.height);
    const isContainsBar = this.data.values.filter(s => s.type == PlotType.Bar).length > 0;
    if (this.data.xTitle || this.data.yTitle) {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = Theme.text;
        if (this.data.xTitle)
            ctx.fillText(this.data.xTitle, __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left + (this.canvas.width - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").right) / 2, this.canvas.height - 4);
        if (this.data.yTitle) {
            ctx.rotate(-Math.PI / 2);
            ctx.textBaseline = 'top';
            ctx.fillText(this.data.yTitle, -(__classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top + (this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom) / 2), 8);
            ctx.resetTransform();
        }
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const step = __classPrivateFieldGet(this, _PlotRenderer_x, "f").step, xYPos = this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom;
    let xCounter = 0, acc = __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left + step / 2;
    for (let i = 0; i < __classPrivateFieldGet(this, _PlotRenderer_allValuesX, "f").length + 1; i++)
        __classPrivateFieldGet(this, _PlotRenderer_labelsX, "f").trySet(Math.round(__classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left + i * __classPrivateFieldGet(this, _PlotRenderer_x, "f").step), this.data.xType == PlotAxisType.Date
            ? Formatter.date(new Date(__classPrivateFieldGet(this, _PlotRenderer_allValuesX, "f")[i - 1]))
            : isNaN(+__classPrivateFieldGet(this, _PlotRenderer_x, "f").min) || !isFinite(+__classPrivateFieldGet(this, _PlotRenderer_x, "f").min)
                ? __classPrivateFieldGet(this, _PlotRenderer_allValuesX, "f")[i - 1]
                : Formatter.number(__classPrivateFieldGet(this, _PlotRenderer_x, "f").min + i * (__classPrivateFieldGet(this, _PlotRenderer_x, "f").max - __classPrivateFieldGet(this, _PlotRenderer_x, "f").min) / (__classPrivateFieldGet(this, _PlotRenderer_x, "f").count - 1)));
    const maxLabelWidth = Math.max(...[...__classPrivateFieldGet(this, _PlotRenderer_labelsX, "f").values()].map(label => Math.ceil(Helper.stringWidth(label)))) + 10;
    const maxCount = Math.floor((this.canvas.width - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").right) / maxLabelWidth);
    const renderStep = Math.ceil(1 / (maxCount / __classPrivateFieldGet(this, _PlotRenderer_allValuesX, "f").length));
    while (acc < this.canvas.width - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").right) {
        if (xCounter % renderStep == 0) {
            ctx.fillStyle = Theme.text + 'b7';
            ctx.fillText(__classPrivateFieldGet(this, _PlotRenderer_labelsX, "f").get(Math.round(acc - __classPrivateFieldGet(this, _PlotRenderer_x, "f").step / 2)) ?? '', acc, xYPos + axisLabelOffset / 2);
        }
        acc += step;
        xCounter++;
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const yCount = __classPrivateFieldGet(this, _PlotRenderer_y, "f").count > 10 ? 10 : __classPrivateFieldGet(this, _PlotRenderer_y, "f").count;
    let yCounter = isContainsBar ? 1 : 0, yStep = __classPrivateFieldGet(this, _PlotRenderer_allValuesY, "f").length / yCount;
    for (let i = isContainsBar ? 1 : 0; i < __classPrivateFieldGet(this, _PlotRenderer_allValuesY, "f").length + 1; i++) {
        const labelY = this.canvas.height - yCounter * yStep * __classPrivateFieldGet(this, _PlotRenderer_y, "f").step - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom, labelYAsKey = Math.round(this.canvas.height - i * __classPrivateFieldGet(this, _PlotRenderer_y, "f").step - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom);
        if (!__classPrivateFieldGet(this, _PlotRenderer_labelsY, "f").get(labelYAsKey))
            __classPrivateFieldGet(this, _PlotRenderer_labelsY, "f").set(labelYAsKey, Formatter.number(__classPrivateFieldGet(this, _PlotRenderer_y, "f").min + (i + (isContainsBar ? -1 : 0)) * (__classPrivateFieldGet(this, _PlotRenderer_y, "f").max - __classPrivateFieldGet(this, _PlotRenderer_y, "f").min) / __classPrivateFieldGet(this, _PlotRenderer_y, "f").count));
        if (i >= yCounter * yStep) {
            const label = {
                x: __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left,
                y: labelY,
                label: __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") >= 1
                    ? Math.round((__classPrivateFieldGet(this, _PlotRenderer_y, "f").min + (yCounter * yStep + (isContainsBar ? -1 : 0)) * (__classPrivateFieldGet(this, _PlotRenderer_y, "f").max - __classPrivateFieldGet(this, _PlotRenderer_y, "f").min) / __classPrivateFieldGet(this, _PlotRenderer_y, "f").count) / __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f")) * __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f")
                    : Math.round(__classPrivateFieldGet(this, _PlotRenderer_y, "f").min + (yCounter * yStep + (isContainsBar ? -1 : 0)) * (__classPrivateFieldGet(this, _PlotRenderer_y, "f").max - __classPrivateFieldGet(this, _PlotRenderer_y, "f").min) / __classPrivateFieldGet(this, _PlotRenderer_y, "f").count / __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f")) * __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f")
            };
            let postfix = '';
            if (this.data.shortLabels) {
                const countOfTens = Math.floor(label.label.toString().length / 4);
                if (countOfTens > 0) {
                    label.label /= Math.pow(1000, countOfTens);
                    postfix = [
                        TextResources.ThousandShort,
                        TextResources.MillionShort,
                        TextResources.BillionShort
                    ][countOfTens - 1];
                }
            }
            ctx.fillText(Formatter.number(label.label) + postfix, label.x - axisLabelOffset, label.y + (isContainsBar ? __classPrivateFieldGet(this, _PlotRenderer_y, "f").step / 2 : 0));
            yCounter++;
        }
    }
    ctx.beginPath();
    ctx.strokeStyle = Theme.line;
    ctx.lineWidth = 1;
    const offset = .5, isBar = this.data.values.filter(v => v.type == PlotType.Bar).length > 0;
    ctx.moveTo(__classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left - offset, this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom + (isBar ? -offset : offset));
    if (isBar)
        ctx.lineTo(__classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left - offset, __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top);
    else
        ctx.lineTo(this.canvas.width - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").right, this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom + offset);
    ctx.stroke();
    if (this.canvas.width > 0 && this.canvas.height > 0)
        createImageBitmap(ctx.getImageData(0, 0, this.canvas.width, this.canvas.height))
            .then(res => __classPrivateFieldSet(this, _PlotRenderer_base, res, "f"));
}, _PlotRenderer_renderBackLines = function _PlotRenderer_renderBackLines() {
    if (this.data.simple)
        return;
    const ctx = Canvas.getContext(this.canvas);
    if (__classPrivateFieldGet(this, _PlotRenderer_backLines, "f")) {
        ctx.putImageData(__classPrivateFieldGet(this, _PlotRenderer_backLines, "f"), 0, 0);
        return;
    }
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const axisLineColor = Theme.lineAxis;
    const isContainsBar = this.data.values.filter(s => s.type == PlotType.Bar).length > 0;
    if (isContainsBar) {
        const step = __classPrivateFieldGet(this, _PlotRenderer_x, "f").step, xYPos = this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom;
        let xCounter = 0, acc = __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left + step / 2;
        for (let i = 0; i < __classPrivateFieldGet(this, _PlotRenderer_allValuesX, "f").length + 1; i++)
            __classPrivateFieldGet(this, _PlotRenderer_labelsX, "f").trySet(Math.round(__classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left + i * __classPrivateFieldGet(this, _PlotRenderer_x, "f").step), this.data.xType == PlotAxisType.Date
                ? Formatter.date(new Date(__classPrivateFieldGet(this, _PlotRenderer_allValuesX, "f")[i - 1]))
                : isNaN(+__classPrivateFieldGet(this, _PlotRenderer_x, "f").min) || !isFinite(+__classPrivateFieldGet(this, _PlotRenderer_x, "f").min)
                    ? __classPrivateFieldGet(this, _PlotRenderer_allValuesX, "f")[i - 1]
                    : Formatter.number(__classPrivateFieldGet(this, _PlotRenderer_x, "f").min + i * (__classPrivateFieldGet(this, _PlotRenderer_x, "f").max - __classPrivateFieldGet(this, _PlotRenderer_x, "f").min) / (__classPrivateFieldGet(this, _PlotRenderer_x, "f").count - 1)));
        const maxLabelWidth = Math.max(...[...__classPrivateFieldGet(this, _PlotRenderer_labelsX, "f").values()].map(label => Math.ceil(Helper.stringWidth(label)))) + 10;
        const maxCount = Math.floor((this.canvas.width - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").right) / maxLabelWidth);
        const renderStep = Math.ceil(1 / (maxCount / __classPrivateFieldGet(this, _PlotRenderer_allValuesX, "f").length));
        while (acc < this.canvas.width - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").right) {
            if (xCounter % renderStep == 0) {
                ctx.beginPath();
                ctx.moveTo(acc, xYPos);
                ctx.lineTo(acc, __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top);
                ctx.lineWidth = 1;
                ctx.strokeStyle = axisLineColor;
                ctx.stroke();
            }
            acc += step;
            xCounter++;
        }
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const yCount = __classPrivateFieldGet(this, _PlotRenderer_y, "f").count > 10 ? 10 : __classPrivateFieldGet(this, _PlotRenderer_y, "f").count;
    let yCounter = isContainsBar ? 1 : 0, yStep = __classPrivateFieldGet(this, _PlotRenderer_allValuesY, "f").length / yCount;
    for (let i = isContainsBar ? 1 : 0; i < __classPrivateFieldGet(this, _PlotRenderer_allValuesY, "f").length + 1; i++) {
        const labelY = this.canvas.height - yCounter * yStep * __classPrivateFieldGet(this, _PlotRenderer_y, "f").step - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom;
        if (i >= yCounter * yStep) {
            const label = {
                x: __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left,
                y: labelY
            };
            if (this.data.values.filter(s => s.type.isAnyEquals(PlotType.Column, PlotType.StackingColumn, PlotType.Line)).length > 0) {
                ctx.beginPath();
                ctx.moveTo(label.x, label.y);
                ctx.lineTo(this.canvas.width - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").right, label.y);
                ctx.lineWidth = 1;
                ctx.strokeStyle = axisLineColor;
                ctx.stroke();
            }
            yCounter++;
        }
    }
    if (this.canvas.width > 0 && this.canvas.height > 0)
        __classPrivateFieldSet(this, _PlotRenderer_backLines, ctx.getImageData(0, 0, this.canvas.width, this.canvas.height), "f");
}, _PlotRenderer_calculateSizes = function _PlotRenderer_calculateSizes() {
    let xValues = this.data.values.flatMap(s => s.values.map(p => p.x)), yValues = this.data.values.flatMap(s => s.values.map(p => p.y));
    const isDate = this.data.xType == PlotAxisType.Date;
    if (isDate) {
        let tempDate = new Date(Math.min(...xValues));
        while (tempDate.getTime() < Math.max(...xValues)) {
            if (!xValues.includes(tempDate.getTime()))
                xValues.push(new Date(tempDate.getTime()));
            tempDate = tempDate.addDays(1);
        }
        xValues.sort((a, b) => a < b ? -1 : 1);
    }
    yValues.sort((a, b) => b > a ? -1 : 1);
    __classPrivateFieldSet(this, _PlotRenderer_allValuesX, [...new Set(xValues.filter(x => x != undefined).map(x => isDate ? x.toString() : x))], "f");
    __classPrivateFieldSet(this, _PlotRenderer_allValuesY, [...new Set(yValues.filter(y => y != undefined))], "f");
    __classPrivateFieldSet(this, _PlotRenderer_x, {
        min: Math.min(...xValues),
        max: Math.max(...xValues),
        unit: (Math.abs(Math.min(...xValues)) + Math.abs(Math.max(...xValues))) / (__classPrivateFieldGet(this, _PlotRenderer_allValuesX, "f").length - 1),
        step: (this.canvas.width - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").right) / __classPrivateFieldGet(this, _PlotRenderer_allValuesX, "f").length,
        minStep: 0,
        count: __classPrivateFieldGet(this, _PlotRenderer_allValuesX, "f").length
    }, "f");
    let yMin = Math.min(...yValues);
    if (yMin > 0)
        yMin = 0;
    __classPrivateFieldSet(this, _PlotRenderer_y, {
        min: yMin,
        max: this.data.yMax ?? Math.max(...yValues),
        unit: (Math.abs(yMin) + Math.abs(this.data.yMax ?? Math.max(...yValues))) / (__classPrivateFieldGet(this, _PlotRenderer_allValuesY, "f").length - 1),
        step: (this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom) / __classPrivateFieldGet(this, _PlotRenderer_allValuesY, "f").length,
        minStep: 0,
        count: __classPrivateFieldGet(this, _PlotRenderer_allValuesY, "f").length
    }, "f");
    let stackingColumns = this.data.values.filter(s => s.type == PlotType.StackingColumn);
    let max;
    if (stackingColumns.length > 0) {
        let values = stackingColumns.map(s => s.values.flatMap(v => +v.y));
        max = __classPrivateFieldGet(this, _PlotRenderer_y, "f").max;
        for (let i = 0; i < values[0].length; i++) {
            let sum = 0;
            for (const v of values)
                sum += v[i];
            if (sum > max)
                max = sum;
        }
        __classPrivateFieldGet(this, _PlotRenderer_y, "f").max = max > this.data.yMax ? this.data.yMax : max;
        __classPrivateFieldGet(this, _PlotRenderer_y, "f").unit = (Math.abs(__classPrivateFieldGet(this, _PlotRenderer_y, "f").min) + Math.abs(__classPrivateFieldGet(this, _PlotRenderer_y, "f").max)) / (__classPrivateFieldGet(this, _PlotRenderer_allValuesY, "f").length - 1);
    }
    const yMaxWidth = Helper.stringWidth(Formatter.number(__classPrivateFieldGet(this, _PlotRenderer_y, "f").max));
    if (yMaxWidth > __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left - 40) {
        __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left += yMaxWidth - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left + 40;
        __classPrivateFieldGet(this, _PlotRenderer_x, "f").step = (this.canvas.width - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").right) / __classPrivateFieldGet(this, _PlotRenderer_allValuesX, "f").length;
    }
    __classPrivateFieldSet(this, _PlotRenderer_yAxisStep, Math.abs(__classPrivateFieldGet(this, _PlotRenderer_y, "f").min) + Math.abs(__classPrivateFieldGet(this, _PlotRenderer_y, "f").max), "f");
    if (.5 <= __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") && __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") < 1)
        __classPrivateFieldSet(this, _PlotRenderer_yAxisStep, .05, "f");
    else if (1 <= __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") && __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") < 10)
        __classPrivateFieldSet(this, _PlotRenderer_yAxisStep, .1, "f");
    else if (10 <= __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") && __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") < 100)
        __classPrivateFieldSet(this, _PlotRenderer_yAxisStep, 2, "f");
    else if (100 <= __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") && __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") < 1000)
        __classPrivateFieldSet(this, _PlotRenderer_yAxisStep, 20, "f");
    else if (1000 <= __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") && __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") < 10000)
        __classPrivateFieldSet(this, _PlotRenderer_yAxisStep, 50, "f");
    else if (10000 <= __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") && __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") < 100000)
        __classPrivateFieldSet(this, _PlotRenderer_yAxisStep, 1000, "f");
    else if (100000 <= __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") && __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") < 1000000)
        __classPrivateFieldSet(this, _PlotRenderer_yAxisStep, 10000, "f");
    else if (1000000 <= __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") && __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") < 10000000)
        __classPrivateFieldSet(this, _PlotRenderer_yAxisStep, 50000, "f");
    else
        __classPrivateFieldSet(this, _PlotRenderer_yAxisStep, 1, "f");
    if (__classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") != 1) {
        max = yValues.length > 10
            ? (__classPrivateFieldGet(this, _PlotRenderer_y, "f").max / 10 + __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f") - (__classPrivateFieldGet(this, _PlotRenderer_y, "f").max / 10) % __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f")) * 10
            : Math.ceil(__classPrivateFieldGet(this, _PlotRenderer_y, "f").max / __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f")) * __classPrivateFieldGet(this, _PlotRenderer_yAxisStep, "f");
        __classPrivateFieldGet(this, _PlotRenderer_y, "f").max = max > this.data.yMax ? this.data.yMax : max;
        __classPrivateFieldGet(this, _PlotRenderer_y, "f").unit = (Math.abs(__classPrivateFieldGet(this, _PlotRenderer_y, "f").min) + Math.abs(__classPrivateFieldGet(this, _PlotRenderer_y, "f").max)) / __classPrivateFieldGet(this, _PlotRenderer_allValuesY, "f").length;
    }
    __classPrivateFieldSet(this, _PlotRenderer_plot, {
        width: this.canvas.width - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").left - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").right,
        height: this.canvas.height - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").top - __classPrivateFieldGet(this, _PlotRenderer_paddings, "f").bottom
    }, "f");
    __classPrivateFieldGet(this, _PlotRenderer_x, "f").minStep = __classPrivateFieldGet(this, _PlotRenderer_plot, "f").width * 0.002;
    __classPrivateFieldGet(this, _PlotRenderer_y, "f").minStep = __classPrivateFieldGet(this, _PlotRenderer_plot, "f").height * 0.002;
};
var _TreeRenderer_instances, _TreeRenderer_isInCell, _TreeRenderer_drawEmpty;
class TreeRenderer extends Renderer {
    constructor(chart) {
        super(chart);
        _TreeRenderer_instances.add(this);
        this.settings.enableLegend = false;
        this.data.values = this.data.values.map(v => new Sector(v));
        this.data.values.sort((a, b) => b.value > a.value ? 1 : -1);
        const baseColor = this.settings.baseColor ?? Helper.randomColor();
        let adjustStep = Math.round(100 / this.data.values.length), adjustAmount = -50;
        if (adjustStep <= 1)
            adjustStep = 1;
        for (let item of this.data.values)
            item.color = Helper.adjustColor(baseColor, adjustAmount += adjustStep);
    }
    render() {
        super.render();
        if (this.data.values.filter(v => v.value > 0).length == 0) {
            __classPrivateFieldGet(this, _TreeRenderer_instances, "m", _TreeRenderer_drawEmpty).call(this);
            return;
        }
        let titleOffset = this.settings.title ? Constants.Values.titleOffset : 0;
        let maxWidth = this.canvas.width - this.data.padding * 2, maxHeight = this.canvas.height - this.data.padding * 2 - titleOffset;
        let sum = this.data.values.reduce((acc, cur) => acc + cur.value, 0), totalSquare = maxWidth * maxHeight;
        let x = this.data.padding, y = this.data.padding + titleOffset;
        let minX = this.data.padding, minY = this.data.padding + titleOffset;
        let tooltipCell = undefined;
        let contextMenuData = undefined;
        const ctx = Canvas.getContext(this.canvas);
        let isVertical = true;
        for (let i = 0; i < this.data.values.length; i++) {
            const item = this.data.values[i];
            const remainWidth = maxWidth - minX - this.data.padding, remainHeight = maxHeight - minY + titleOffset - this.data.padding;
            let cells = [
                {
                    color: item.color,
                    label: item.label,
                    s: item.value / sum * totalSquare,
                    value: item.value,
                    id: item.id,
                    x: x,
                    y: y,
                    w: 0,
                    h: 0
                }
            ];
            if (i + 1 <= this.data.values.length - 1) {
                const next = this.data.values[i + 1];
                cells.push({
                    color: next.color,
                    label: next.label,
                    s: next.value / sum * totalSquare,
                    value: next.value,
                    id: next.id,
                    x: x,
                    y: y,
                    w: 0,
                    h: 0
                });
                i++;
            }
            const isSingle = cells.length == 1, isLast = i == this.data.values.length - 1;
            if (isVertical) {
                for (let j = 1; j <= remainWidth + i * i; j++) {
                    const w = remainWidth - j, h1 = cells[0].s / w, h2 = isSingle ? 0 : cells[1].s / w;
                    if (h1 + h2 >= remainHeight) {
                        cells[0].w = Math.floor(w);
                        cells[0].h = Math.floor(h1);
                        if (!isSingle) {
                            cells[1].w = Math.floor(w);
                            cells[1].h = remainHeight - cells[0].h;
                            cells[1].y += cells[0].h;
                        }
                        break;
                    }
                }
            }
            else {
                for (let j = 1; j <= remainHeight + i * i; j++) {
                    const h = remainHeight - j, w1 = cells[0].s / h, w2 = isSingle ? 0 : cells[1].s / h;
                    if (w1 + w2 >= remainWidth) {
                        cells[0].h = Math.floor(h);
                        cells[0].w = Math.floor(w1);
                        if (!isSingle) {
                            cells[1].h = Math.floor(h);
                            cells[1].w = remainWidth - cells[0].w;
                            cells[1].x += cells[0].w;
                        }
                        break;
                    }
                }
            }
            for (const cell of cells) {
                if (isLast) {
                    if (isVertical) {
                        cell.w = remainWidth;
                        if (isSingle)
                            cell.h = remainHeight;
                    }
                    else {
                        cell.h = remainHeight;
                        if (isSingle)
                            cell.w = remainWidth;
                    }
                }
                ctx.beginPath();
                ctx.fillStyle = cell.color;
                const cellInit = this.state != RenderState.Init
                    && !this.animations.contains(cell.id, AnimationType.Init);
                const cellIndex = i + cells.indexOf(cell) + (isLast && isSingle ? 1 : 0), duration = 260;
                const getPrev = () => {
                    let acc = 0;
                    for (let i = 0; i < cellIndex; i++)
                        acc += duration - duration * (i / this.data.values.length) / Math.E;
                    return acc;
                };
                const initAnimationDuration = duration - duration * cellIndex / (this.data.values.length + 1);
                if (!cellInit) {
                    this.animations.add(cell.id, AnimationType.Init, {
                        duration: getPrev(),
                        continuous: true,
                        body: transition => {
                            if (transition * getPrev() - getPrev() + initAnimationDuration < 0)
                                return ctx.fillStyle += '00';
                            transition = (transition * getPrev() - getPrev() + initAnimationDuration) / initAnimationDuration;
                            const center = {
                                x: cell.x + cell.w / 2,
                                y: cell.y + cell.h / 2
                            };
                            const minSize = .7, rest = 1 - minSize;
                            ctx.translate(center.x - center.x * (minSize + transition * rest), center.y - center.y * (minSize + transition * rest));
                            ctx.scale((minSize + transition * rest), (minSize + transition * rest));
                            let opacity = Math.round(255 * transition).toString(16);
                            if (opacity.length < 2)
                                opacity = 0 + opacity;
                            ctx.fillStyle = cell.color + opacity;
                        }
                    });
                }
                else {
                    const translate = (transition, event) => {
                        const center = {
                            x: cell.x + cell.w / 2,
                            y: cell.y + cell.h / 2
                        };
                        const margin = 12, minSize = cell.w > cell.h
                            ? 1 - margin / cell.w
                            : 1 - margin / cell.h, rest = 1 - minSize;
                        ctx.translate(center.x - center.x * (minSize + transition * rest), center.y - center.y * (minSize + transition * rest));
                        ctx.scale(minSize + transition * rest, minSize + transition * rest);
                        this.animations.reload(cell.id, event);
                    };
                    if (__classPrivateFieldGet(this, _TreeRenderer_instances, "m", _TreeRenderer_isInCell).call(this, cell)
                        && !tooltipCell) {
                        tooltipCell = cell;
                        contextMenuData = cell.data;
                        this.animations.add(cell.id, AnimationType.MouseOver, {
                            duration: Constants.Animations.tree,
                            backward: true,
                            body: transition => {
                                translate(transition, AnimationType.MouseLeave);
                            }
                        });
                    }
                    else {
                        this.animations.add(cell.id, AnimationType.MouseLeave, {
                            timer: Constants.Dates.minDate,
                            duration: Constants.Animations.tree,
                            body: transition => {
                                translate(transition, AnimationType.MouseOver);
                            }
                        });
                    }
                }
                const gap = 4;
                ctx.roundRect(x + gap, y + gap, cell.w - gap, cell.h - gap, gap * 2);
                ctx.fill();
                if (cell.label
                    && Helper.stringWidth(cell.label) < cell.w - gap
                    && cell.h - gap > 16
                    && !this.animations.contains(cell.id, AnimationType.Init)) {
                    ctx.beginPath();
                    TextStyles.large(ctx);
                    ctx.fillStyle = !Helper.isColorVisible(cell.color, '#ffffff')
                        ? '#000000'
                        : '#ffffff';
                    ctx.fillText(cell.label, x + 2 + cell.w / 2, y + 2 + cell.h / 2);
                }
                ctx.resetTransform();
                if (isVertical)
                    y += cell.h;
                else
                    x += cell.w;
                totalSquare -= cell.w * cell.h;
                sum -= cell.value;
            }
            if (isVertical) {
                x += cells[0].w;
                y = minY;
            }
            else {
                y += cells[0].h;
                x = minX;
            }
            minX = x;
            minY = y;
            isVertical = !isVertical;
        }
        this.tooltip.render(!!tooltipCell && !this.dropdown?.isActive, this.onMouseMoveEvent, [
            new TooltipValue(`${tooltipCell?.label}: ${Formatter.number(tooltipCell?.value)}`)
        ], this.data.values.find(v => v.id == tooltipCell?.id));
        if (!this.isDestroy)
            requestAnimationFrame(this.render.bind(this));
        this.state = RenderState.Idle;
        super.renderDropdown();
        if (tooltipCell || this.contextMenu)
            this.renderContextMenu(contextMenuData);
        else
            this.onContextMenuEvent = undefined;
    }
    refresh() {
        super.refresh();
    }
    resize() {
        super.resize();
        this.initAnimations();
        this.animations.clear();
    }
    prepareSettings() {
        this.data.values = this.data.values.filter(v => v.value > 0);
        this.data.values.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
        super.prepareSettings();
        for (let item of this.data.values) {
            item.disabled = !item.value;
            item.value ??= 0;
        }
    }
    initDropdown() {
        super.initDropdown();
        this.dropdown = new Dropdown(this.canvas, {
            x: -10,
            y: 10,
            text: TextResources.menu,
            items: [
                {
                    text: TextResources.exportCSV,
                    action: () => {
                        Export.asCsv(Decomposition.toTable(TreeData.getRows(this.data)), this.settings.title);
                    }
                },
                {
                    isDivider: true
                },
                {
                    text: TextResources.decomposeToTable,
                    action: () => {
                        new Modal(Decomposition.toTable(TreeData.getRows(this.data))).open();
                    }
                }
            ]
        });
    }
}
_TreeRenderer_instances = new WeakSet(), _TreeRenderer_isInCell = function _TreeRenderer_isInCell(cell) {
    if (!this.onMouseMoveEvent || !cell)
        return false;
    const mouse = this.getMousePosition(this.onMouseMoveEvent);
    return !(this.dropdown?.isActive ?? false)
        && cell.x <= mouse.x && mouse.x <= cell.x + cell.w
        && cell.y <= mouse.y && mouse.y <= cell.y + cell.h;
}, _TreeRenderer_drawEmpty = function _TreeRenderer_drawEmpty() {
    const ctx = Canvas.getContext(this.canvas);
    TextStyles.regular(ctx);
    ctx.fillText(TextResources.incorrectValues, this.canvas.width / 2, this.canvas.height / 2);
};
var AnimationType;
(function (AnimationType) {
    AnimationType[AnimationType["MouseOver"] = 0] = "MouseOver";
    AnimationType[AnimationType["MouseLeave"] = 1] = "MouseLeave";
    AnimationType[AnimationType["Init"] = 2] = "Init";
    AnimationType[AnimationType["Click"] = 3] = "Click";
    AnimationType[AnimationType["AnotherItemOver"] = 4] = "AnotherItemOver";
    AnimationType[AnimationType["AnotherItemLeave"] = 5] = "AnotherItemLeave";
})(AnimationType || (AnimationType = {}));
var Attribute;
(function (Attribute) {
    Attribute["Name"] = "name";
})(Attribute || (Attribute = {}));
var ChartType;
(function (ChartType) {
    ChartType[ChartType["Plot"] = 0] = "Plot";
    ChartType[ChartType["Circular"] = 1] = "Circular";
    ChartType[ChartType["Gauge"] = 2] = "Gauge";
    ChartType[ChartType["TreeMap"] = 3] = "TreeMap";
})(ChartType || (ChartType = {}));
var ErrorType;
(function (ErrorType) {
    ErrorType["NullContext"] = "Can't find context";
    ErrorType["ElementNotExist"] = "Element does not exist";
})(ErrorType || (ErrorType = {}));
var Events;
(function (Events) {
    Events["VisibilityChanged"] = "visibilitychange";
    Events["Blur"] = "blur";
    Events["MouseMove"] = "mousemove";
    Events["Click"] = "click";
    Events["Change"] = "change";
    Events["ContextMenu"] = "contextmenu";
})(Events || (Events = {}));
var LegendPlace;
(function (LegendPlace) {
    LegendPlace[LegendPlace["Bottom"] = 0] = "Bottom";
    LegendPlace[LegendPlace["Left"] = 1] = "Left";
    LegendPlace[LegendPlace["Top"] = 2] = "Top";
    LegendPlace[LegendPlace["Right"] = 3] = "Right";
})(LegendPlace || (LegendPlace = {}));
var LineType;
(function (LineType) {
    LineType[LineType["Solid"] = 0] = "Solid";
    LineType[LineType["Dash"] = 1] = "Dash";
    LineType[LineType["Dotted"] = 2] = "Dotted";
})(LineType || (LineType = {}));
var PlotAxisType;
(function (PlotAxisType) {
    PlotAxisType[PlotAxisType["Date"] = 1] = "Date";
})(PlotAxisType || (PlotAxisType = {}));
var PlotType;
(function (PlotType) {
    PlotType[PlotType["Line"] = 0] = "Line";
    PlotType[PlotType["AttentionLine"] = 1] = "AttentionLine";
    PlotType[PlotType["Column"] = 2] = "Column";
    PlotType[PlotType["Bar"] = 3] = "Bar";
    PlotType[PlotType["StackingColumn"] = 4] = "StackingColumn";
})(PlotType || (PlotType = {}));
var Tag;
(function (Tag) {
    Tag["Canvas"] = "canvas";
    Tag["A"] = "a";
    Tag["Div"] = "div";
    Tag["Dialog"] = "dialog";
    Tag["Table"] = "table";
    Tag["Script"] = "script";
})(Tag || (Tag = {}));
var RenderState;
(function (RenderState) {
    RenderState[RenderState["Idle"] = 0] = "Idle";
    RenderState[RenderState["Init"] = 1] = "Init";
})(RenderState || (RenderState = {}));
class TextResources {
}
TextResources.exportPNG = 'Save as image...';
TextResources.decomposeToTable = 'Show as table...';
TextResources.reset = 'Reset';
TextResources.exportCSV = 'Save as table...';
TextResources.menu = 'Menu';
TextResources.allDataIsHidden = 'All data is hidden';
TextResources.other = 'Other';
TextResources.incorrectValues = 'Incorrect values';
TextResources.ThousandShort = 'K';
TextResources.MillionShort = 'M';
TextResources.BillionShort = 'B';
TextResources.Show = 'Show...';
TextResources.NoLabel = 'No Label';
var Constants;
(function (Constants) {
    class Animations {
    }
    Animations.circular = 335;
    Animations.legend = 500;
    Animations.tree = 250;
    Animations.tooltip = 120;
    Animations.button = 200;
    Constants.Animations = Animations;
})(Constants || (Constants = {}));
var Constants;
(function (Constants) {
    class Dates {
    }
    Dates.minDate = new Date(2000, 1, 1);
    Constants.Dates = Dates;
})(Constants || (Constants = {}));
var Styles;
(function (Styles) {
    class Cursor {
    }
    Cursor.Default = 'default';
    Cursor.Pointer = 'pointer';
    Styles.Cursor = Cursor;
    class Display {
    }
    Display.Flex = 'flex';
    Styles.Display = Display;
    class FlexDirection {
    }
    FlexDirection.Column = 'column';
    FlexDirection.ColumnReverse = 'column-reverse';
    FlexDirection.Row = 'row';
    FlexDirection.RowReverse = 'row-reverse';
    Styles.FlexDirection = FlexDirection;
    class AlignItems {
    }
    AlignItems.Center = 'center';
    Styles.AlignItems = AlignItems;
    class Visibility {
    }
    Visibility.Visible = 'visible';
    Visibility.Hidden = 'hidden';
    Styles.Visibility = Visibility;
    class Position {
    }
    Position.Absolute = 'absolute';
    Styles.Position = Position;
    class PointerEvents {
    }
    PointerEvents.None = 'none';
    Styles.PointerEvents = PointerEvents;
    class JustifyContent {
    }
    JustifyContent.Center = 'center';
    Styles.JustifyContent = JustifyContent;
    class ImageRendering {
    }
    ImageRendering.Pixelated = 'pixelated';
    Styles.ImageRendering = ImageRendering;
})(Styles || (Styles = {}));
var Constants;
(function (Constants) {
    class Values {
    }
    Values.titleOffset = 30;
    Constants.Values = Values;
})(Constants || (Constants = {}));
class AnimationItem {
    constructor() {
        this.continuous = false;
        this.backward = false;
    }
}
class ButtonOptions {
}
class ChartSettings {
}
class CircularAngle {
}
class Color {
}
class DropdownItem {
}
class DropdownOptions {
}
class HoverItem {
}
class Paddings {
}
class PlotAxis {
}
class PlotPoint extends (/* unused pure expression or super */ null && (Value)) {
}
class PlotSeries extends Value {
    constructor(obj) {
        super();
        this.lineType = LineType.Solid;
        Object.assign(this, obj);
    }
    toggle(transition) {
        super.toggle(transition);
    }
    checkCondition() {
        super.checkCondition();
        return true;
    }
    reset() {
        super.reset();
    }
}
class Point {
}
class Sector extends Value {
    constructor(obj) {
        super();
        Object.assign(this, obj);
    }
    toggle(transition) {
        super.toggle(transition);
        if (this.disabled)
            this.current = this.value * (1 - transition);
        else
            this.current = this.value * transition;
    }
    checkCondition() {
        super.checkCondition();
        return (this.current == 0 && !this.disabled) || this.value != 0;
    }
    reset() {
        super.reset();
        this.current = this.value;
    }
}
class TableData {
}
class TableHeaderValue {
}
class TableValue {
}
class TooltipValue {
    constructor(text, color) {
        this.text = text;
        this.color = color;
    }
}
class TreeCell {
    constructor() {
    }
}
class CircularData {
    static getRows(data) {
        const key = 'Value';
        let values = [];
        for (const value of data.values)
            values.push({
                name: value.label,
                values: new Map([[key, value.value]])
            });
        return {
            headers: [
                {
                    value: key,
                    display: key
                }
            ],
            values: values
        };
    }
}
class GaugeData {
}
class PlotData {
    static getRows(data) {
        let headers = [];
        let values = [];
        for (const series of data.values) {
            let seriesValues = new Map();
            for (const value of series.values) {
                seriesValues.set(value.x.toString(), value.y);
                headers.push({
                    value: value.x.toString(),
                    display: data.xType == PlotAxisType.Date
                        ? Formatter.date(new Date(value.x))
                        : value.x.toString()
                });
            }
            values.push({
                name: series.label,
                values: seriesValues
            });
        }
        const unique = new Set(), uniqueHeaders = headers.filter(v => !unique.has(v.display) && unique.add(v.display));
        if (data.xType == PlotAxisType.Date)
            uniqueHeaders.sort((a, b) => new Date(a.value).getTime() - new Date(b.value).getTime());
        return {
            headers: uniqueHeaders,
            values: values
        };
    }
}
class TreeData {
    static getRows(data) {
        const key = 'Value';
        let values = [];
        for (const value of data.values)
            values.push({
                name: value.label,
                values: new Map([[key, value.value]])
            });
        return {
            headers: [
                {
                    value: key,
                    display: key
                }
            ],
            values: values
        };
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	__webpack_modules__[832]();
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__[172]();
/******/ 	
/******/ })()
;
//# sourceMappingURL=ocharts.js.map