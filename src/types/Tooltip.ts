export type TooltipResolver = () => string

export type Tooltip = string | TooltipResolver

export function resolveTooltip(tooltip: Tooltip | null): string | null {
    if (tooltip == null)
        return null

    return typeof tooltip == 'function' ? tooltip() : tooltip
}