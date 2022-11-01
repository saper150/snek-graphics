
import SimplexNoise from 'simplex-noise'
import { data } from './flowData'


const frequency = 0.0007

const noise = new SimplexNoise()
export function flowForPoint(x: number, y: number, elapsedTime: number) {
    const e = ff(x, y)
    return { x: Math.cos(e), y: Math.sin(e) }
    // return ff(x, y)
    // const angle = noise.noise3D(x * frequency, y * frequency, elapsedTime / 50000) * Math.PI * 3
    // return { x: Math.cos(angle), y: Math.sin(angle) }
}


function angleForPoint(x: number, y: number): number {
    return data.data[data.width * y + x]
}

export function ff(x: number, y: number) {
    return angleForPoint(Math.min(data.width, Math.max(0, Math.round(x))), Math.min(data.height, Math.max(0, Math.round(y))))
}
