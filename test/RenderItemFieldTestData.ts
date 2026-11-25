import RenderItemField from '@/types/RenderItemField'
import RenderItem from '@/types/RenderItem'
import CanvasWindow from '@/types/CanvasWindow'
import FieldRenderData from '@/types/FieldRenderData'

export const WINDOW = new CanvasWindow(1000, 1000)

export const IDENTITY_LUT = Uint32Array.from({ length: 256 }, (_, index) => index)

export const OPAQUE_LUT = Uint32Array.from({ length: 256 }, (_, index) => (0xff000000 | index) >>> 0)

export const fieldData = (values: number[], extra: Partial<FieldRenderData> = {}): FieldRenderData => {
    return {
        columns: values.length,
        rows: 1,
        values: Float32Array.from(values),
        min: 0,
        max: 100,
        lut: IDENTITY_LUT,
        ...extra
    }
}

export const fieldItem = (field: FieldRenderData | null = fieldData([0, 100])) => {
    const shape = new RenderItemField()

    shape.box = { x: 1000, y: 2000, width: 500, height: 250 }
    shape.field = field

    return shape
}

export const renderItem = (shape: RenderItemField) => {
    const item = new RenderItem(shape)

    item.animation.init = 1

    return item
}

export const context = () => {
    return {
        drawImage: jest.fn(),
        imageSmoothingEnabled: false,
        imageSmoothingQuality: 'low'
    }
}