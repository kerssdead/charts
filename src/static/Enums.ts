export enum AnimationType {
    None,

    MouseOver,

    MouseLeave,

    Init
}

export enum Attribute {
    Name = 'name'
}

export enum ChartType {
    Plot,

    Pie,

    Gauge,

    TreeMap
}

export enum ErrorType {
    NullContext = 'Can\'t find context',

    ElementNotExist = 'Element does not exist',

    NotImplemented = 'Not Implemented'
}

export enum Events {
    Blur = 'blur',

    Click = 'click',

    Change = 'change',

    ContextMenu = 'contextmenu',

    PointerDown = 'pointerdown',

    PointerMove = 'pointermove',

    PointerLeave = 'pointerleave',

    LostPointerCapture = 'lostpointercapture',

    Wheel = 'wheel'
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

export enum Icon {
    ThreeLines = '☰',

    Close = '×'
}

export enum RenderGroupDirection {
    Row,

    Column,

    RowReversed,

    ColumnReversed
}

export enum TextAlignment {
    Left = 'start',

    Center = 'center',

    Right = 'end'
}

export enum TextBaseline {
    Alphabetic = 'alphabetic',

    Top = 'top',

    Middle = 'middle',

    Bottom = 'bottom'
}

export enum HorizontalAlignment {
    Left = 'left',

    Center = 'center',

    Right = 'right'
}

export enum VerticalAlignment {
    Top = 'top',

    Center = 'center',

    Bottom = 'bottom'
}