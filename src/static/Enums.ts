export enum AnimationType {
    MouseOver,

    MouseLeave,

    Init,

    Click,

    AnotherItemOver,

    AnotherItemLeave
}

export enum Attribute {
    Name = 'name'
}

export enum ChartType {
    Plot,

    Circular,

    Gauge,

    TreeMap
}

export enum ErrorType {
    NullContext = 'Can\'t find context',

    ElementNotExist = 'Element does not exist'
}

export enum Events {
    VisibilityChanged = 'visibilitychange',

    Blur = 'blur',

    MouseMove = 'mousemove',

    Click = 'click',

    Change = 'change',

    ContextMenu = 'contextmenu'
}

export enum LegendPlace {
    Bottom,

    Left,

    Top,

    Right
}

export enum LineType {
    Solid,

    Dash,

    Dotted
}

export enum PlotAxisType {
    Number,

    Date,

    Text
}

export enum PlotType {
    Line,

    AttentionLine,

    Column,

    Bar,

    StackingColumn
}

export enum Tag {
    Canvas = 'canvas',

    A = 'a',

    Div = 'div',

    Dialog = 'dialog',

    Table = 'table',

    Script = 'script'
}

export enum RenderState {
    Idle,

    Init
}

export enum Icon {
    ThreeLines = '☰'
}