export enum ChartType {
    Plot = 'plot',

    Pie = 'pie',

    Gauge = 'gauge',

    TreeMap = 'tree-map',

    SegmentedBar = 'segmented-bar',

    TreeBar = 'tree-bar'
}

export const enum ErrorType {
    NullContext = 'Can\'t find context',

    InvalidHexColor = 'Invalid hex color',

    UnknownPlotSlot = 'Unknown plot slot',

    InvalidGaugeRange = 'Gauge min is greater than max'
}

export const enum Events {
    Blur = 'blur',

    Click = 'click',

    Change = 'change',

    ContextMenu = 'contextmenu',

    Focus = 'focus',

    FocusOut = 'focusout',

    KeyDown = 'keydown',

    PointerDown = 'pointerdown',

    PointerEnter = 'pointerenter',

    PointerMove = 'pointermove',

    PointerLeave = 'pointerleave',

    Resize = 'resize',

    Scroll = 'scroll',

    Input = 'input',

    LostPointerCapture = 'lostpointercapture',

    Wheel = 'wheel'
}

export const enum PrintEvents {
    Before = 'beforeprint',

    After = 'afterprint'
}

export const enum FontEvents {
    LoadingDone = 'loadingdone'
}

export enum LegendPlace {
    Bottom = 'bottom',

    Left = 'left',

    Top = 'top',

    Right = 'right'
}

export enum PlotAxisType {
    Number = 'number',

    Date = 'date',

    Text = 'text'
}

export enum PlotType {
    Line = 'line',

    AttentionLine = 'attention-line',

    Column = 'column',

    Bar = 'bar',

    StackingColumn = 'stacking-column',

    Area = 'area'
}

export enum LineDrawMode {
    Straight = 'straight',

    Smooth = 'smooth'
}

export const enum PlotOrientation {
    Vertical,

    Horizontal
}

export enum PlotScaleType {
    Category = 'category',

    Linear = 'linear',

    Log = 'log'
}

export const enum TimeUnit {
    Second,

    Minute,

    Hour,

    Day,

    Month,

    Year
}

export const enum Tag {
    Canvas = 'canvas',

    A = 'a',

    Div = 'div',

    Dialog = 'dialog',

    Button = 'button',

    Span = 'span',

    Input = 'input'
}

export const enum TableClasses {
    Tables = 'o-tables',

    Toolbar = 'o-table-toolbar',

    Filter = 'o-table-filter',

    Action = 'o-table-action',

    List = 'o-table-list',

    Group = 'o-table-group',

    Caption = 'o-table-caption',

    Table = 'o-table',

    Header = 'o-table-header',

    Body = 'o-table-body',

    Row = 'o-table-row',

    Footer = 'o-table-footer',

    Number = 'o-table-number',

    Swatch = 'o-table-swatch',

    Disabled = 'o-table-disabled',

    Empty = 'o-table-empty',

    Sortable = 'o-table-sortable',

    SortButton = 'o-table-sort-button',

    ColumnHighlight = 'o-table-column-highlight'
}

export const enum Attribute {
    Role = 'role',

    AriaSort = 'aria-sort',

    AriaLabel = 'aria-label',

    AriaLabelledBy = 'aria-labelledby',

    AriaDescribedBy = 'aria-describedby',

    AriaHidden = 'aria-hidden',

    TabIndex = 'tabindex'
}

export const enum FocusOrder {
    Chart = 0,

    Legend = 1,

    Menu = 2
}

export const enum ChartClasses {
    Canvas = 'o-canvas'
}

export const enum TableColumnKey {
    RowTotal = '\u0000rowTotal',

    Share = '\u0000share'
}

export const enum AriaRole {
    Img = 'img',

    Table = 'table',

    RowGroup = 'rowgroup',

    Row = 'row',

    ColumnHeader = 'columnheader',

    RowHeader = 'rowheader',

    Cell = 'cell'
}

export const enum SortDirection {
    None = 'none',

    Ascending = 'ascending',

    Descending = 'descending'
}

export const enum Icon {
    ThreeDots = '⋯',

    Close = '×'
}

export const enum TextAlignment {
    Left = 'start',

    Center = 'center',

    Right = 'end'
}

export const enum TextDirection {
    LeftToRight = 'ltr'
}

export const enum TextBaseline {
    Alphabetic = 'alphabetic',

    Top = 'top',

    Middle = 'middle'
}

export const enum CompositeOperation {
    SourceOver = 'source-over',

    DestinationIn = 'destination-in'
}

export const enum LineJoin {
    Miter = 'miter',

    Round = 'round'
}

export const enum HorizontalAlignment {
    Left = 'left',

    Center = 'center',

    Right = 'right'
}

export const enum ArcEdge {
    Start = 'start',

    End = 'end'
}

export const enum VerticalAlignment {
    Top = 'top',

    Center = 'center',

    Bottom = 'bottom'
}

export const enum ImageCrossOrigin {
    Auto = 'auto',

    Anonymous = 'anonymous',

    UseCredentials = 'use-credentials',

    None = 'none'
}

export const enum MorphFade {
    In,

    Out
}

export const enum Axis {
    X = 'x',

    Y = 'y'
}