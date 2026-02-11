export enum AnimationType {
    None,

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

    ElementNotExist = 'Element does not exist',

    MaxCallsReach = 'Max calls reach'
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

    Script = 'script',

    Button = 'button',

    Span = 'span'
}

export enum RenderState {
    Idle,

    Init
}

export enum Icon {
    ThreeLines = '☰',

    Close = '×'
}

export enum DrawPointType {
    Move = 'move',

    Line = 'line',

    QuadraticCurve = 'quadratic-curve',

    ArcTo = 'arc-to',

    SemiCircle = 'semi-circle'
}