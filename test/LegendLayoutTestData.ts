import Sector from '@/types/Sector'

globalThis.DOMRect = class {
    constructor(public x = 0, public y = 0, public width = 0, public height = 0) {
    }
} as unknown as typeof DOMRect

export const sectors = (...labels: string[]) => {
    return labels.map(label => new Sector({ label, value: 1 }))
}
