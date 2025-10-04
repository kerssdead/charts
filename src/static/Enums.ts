enum AnimationType {
    MouseOver,

    MouseLeave,

    Init,

    Click
}

enum Attribute {
    Name = 'name'
}

enum ChartType {
    Plot,

    Circular,

    Gauge,

    TreeMap
}

enum ErrorType {
    NullContext = 'Can\'t find context',

    ElementNotExist = 'Element does not exist'
}

enum Events {
    VisibilityChanged = 'visibilitychange',

    Blur = 'blur',

    MouseMove = 'mousemove',

    Click = 'click',

    Change = 'change',

    ContextMenu = 'contextmenu'
}

enum LegendPlace {
    Bottom,

    Left,

    Top,

    Right
}

enum LineType {
    Solid,

    Dash,

    Dotted
}

enum PlotAxisType {
    Date = 1
}

enum PlotType {
    Line,

    AttentionLine,

    Column,

    Bar,

    StackingColumn
}

enum Tag {
    Canvas = 'canvas',

    A = 'a',

    Div = 'div',

    Dialog = 'dialog',

    Table = 'table',

    Script = 'script'
}

enum RenderState {
    Idle,

    Init
}