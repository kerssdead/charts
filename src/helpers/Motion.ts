const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion() {
    return typeof matchMedia === 'function' && matchMedia(REDUCED_MOTION_QUERY).matches
}