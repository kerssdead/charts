import { Events } from '@/static/Enums'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export function prefersReducedMotion() {
    return typeof matchMedia === 'function' && matchMedia(REDUCED_MOTION_QUERY).matches
}

export function onReducedMotionChange(listener: () => void) {
    if (typeof matchMedia !== 'function')
        return () => {}

    const query = matchMedia(REDUCED_MOTION_QUERY)

    query.addEventListener(Events.Change, listener)

    return () => query.removeEventListener(Events.Change, listener)
}