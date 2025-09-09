class Helper {
    static adjustColor(color: string, amount: number) {
        return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2))
    }

    static grayScale(color: string) {
        return '#' + Array(4).join(Math.round([.3, .59, .11].reduce((a, v, i) => a + v * parseInt(color[2 * i + 1] + color[2 * i + 2], 16), 0) / 3).toString(16).padStart(2, '0'))
    }

    static randomColor() {
        let letters = '0123456789ABCDEF',
            color = '#'
        for (let i = 0; i < 6; i++)
            color += letters[Math.floor(Math.random() * 16)]

        return color
    }

    static stringWidth(str: string, font?: number) {
        const widths = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.2796875, 0.2765625, 0.3546875, 0.5546875, 0.5546875, 0.8890625, 0.665625, 0.190625, 0.3328125, 0.3328125, 0.3890625, 0.5828125, 0.2765625, 0.3328125, 0.2765625, 0.3015625, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.2765625, 0.2765625, 0.584375, 0.5828125, 0.584375, 0.5546875, 1.0140625, 0.665625, 0.665625, 0.721875, 0.721875, 0.665625, 0.609375, 0.7765625, 0.721875, 0.2765625, 0.5, 0.665625, 0.5546875, 0.8328125, 0.721875, 0.7765625, 0.665625, 0.7765625, 0.721875, 0.665625, 0.609375, 0.721875, 0.665625, 0.94375, 0.665625, 0.665625, 0.609375, 0.2765625, 0.3546875, 0.2765625, 0.4765625, 0.5546875, 0.3328125, 0.5546875, 0.5546875, 0.5, 0.5546875, 0.5546875, 0.2765625, 0.5546875, 0.5546875, 0.221875, 0.240625, 0.5, 0.221875, 0.8328125, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.3328125, 0.5, 0.2765625, 0.5546875, 0.5, 0.721875, 0.5, 0.5, 0.5, 0.3546875, 0.259375, 0.353125, 0.5890625]
        const avg = 0.5279276315789471
        return Array.from(str).reduce((acc, cur) => acc + (widths[cur.charCodeAt(0)] ?? avg), 0) * (font || 14)
    }

    static guid() {
        const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
        return (S4() + S4() + '-' + S4() + '-4' + S4().slice(0, 3) + '-' + S4() + '-' + S4() + S4() + S4()).toLowerCase()
    }

    static hexToRgb(hex: string): Color {
        if (hex.length > 4) {
            const value = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
            if (value)
                return {
                    r: parseInt(value[1], 16),
                    g: parseInt(value[2], 16),
                    b: parseInt(value[3], 16)
                }
        } else {
            const value = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex)
            if (value)
                return {
                    r: parseInt(value[1] + value[1], 16),
                    g: parseInt(value[2] + value[2], 16),
                    b: parseInt(value[3] + value[3], 16)
                }
        }

        return new Color()
    }

    static isColorVisible(background: string, foreground: string) {
        const backgroundAsRgb = Helper.hexToRgb(background),
            foregroundAsRgb = Helper.hexToRgb(foreground),
            value = .77

        return (backgroundAsRgb.r + backgroundAsRgb.g + backgroundAsRgb.b) / (foregroundAsRgb.r + foregroundAsRgb.g + foregroundAsRgb.b) < value
    }

    static isISOString(str: string) {
        return /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+/.test(str)
    }
}