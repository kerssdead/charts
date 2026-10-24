import Sector from '@/types/Sector'
import TextResources from '@/static/TextResources'
import Theme from '@/Theme'
import { sum } from '@/helpers/Collections'
import { FULL_ANGLE } from '@/static/constants/Index'
import { OTHER_KEY, START_ANGLE } from '@/render/pie/PieConstants'

export type KeyedSector = {
    sector: Sector
    key: string
    groupedSectors?: Sector[]
}

export type PieSlice = KeyedSector & {
    startAngle: number
    angle: number
}

export function hasVisibleValue(sector: Sector) {
    return !sector.disabled && sector.value > 0
}

export function getVisibleTotal(sectors: Sector[]) {
    return sum(sectors.filter(hasVisibleValue), sector => sector.value)
}

export function getRadiansPerUnit(visibleTotal: number) {
    return visibleTotal == 0 ? 0 : FULL_ANGLE / visibleTotal
}

export function getMiddleAngle(slice: PieSlice) {
    return slice.startAngle + slice.angle / 2
}

export function toKeyedSectors(sectors: Sector[]): KeyedSector[] {
    return sectors.map((sector, index) => ({ sector, key: index.toString() }))
}

export function getSectorsWithSmallGroupedIntoOther(
    sectors: Sector[],
    isSmall: (sector: Sector) => boolean
): KeyedSector[] {
    const keyedSectors = toKeyedSectors(sectors)
    const smallSectors = sectors.filter(sector => hasVisibleValue(sector) && isSmall(sector))

    if (smallSectors.length < 2)
        return keyedSectors

    const otherSector = new Sector({
        label: TextResources.other,
        value: sum(smallSectors, sector => sector.value),
        color: Theme.other
    })

    return [
        // todo: smallSectors.includes() makes this O(n·m); measure before switching to a Set
        ...keyedSectors.filter(keyedSector => !smallSectors.includes(keyedSector.sector)),
        { sector: otherSector, key: OTHER_KEY, groupedSectors: smallSectors }
    ]
}

export function getSlices(keyedSectors: KeyedSector[], radiansPerUnit: number): PieSlice[] {
    let startAngle = START_ANGLE

    return keyedSectors.map(keyedSector => {
        const angle = hasVisibleValue(keyedSector.sector) ? keyedSector.sector.value * radiansPerUnit : 0
        const slice = { ...keyedSector, startAngle, angle }

        startAngle += angle

        return slice
    })
}