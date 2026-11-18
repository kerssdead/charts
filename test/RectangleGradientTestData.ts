export const gradientContext = () => {
    const createLinearGradient = jest.fn(() => ({ addColorStop: jest.fn() }))
    const ctx = {
        lineWidth: 1,
        fillStyle: '' as unknown,
        strokeStyle: '' as unknown,
        createLinearGradient,
        save: jest.fn(),
        restore: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn()
    }

    return { ctx, canvas: ctx as unknown as CanvasRenderingContext2D, createLinearGradient }
}