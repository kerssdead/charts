export default abstract class Angle {
    static toRadians(degrees: number) {
        return degrees * Math.PI / 180
    }

    static normalize(angle: number) {
        return Math.atan2(Math.sin(angle), Math.cos(angle))
    }
}