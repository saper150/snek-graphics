

export type Color = readonly [number,number,number,number]
export type GradientSegment = { color: Color, ratio: number }
export type Gradient = GradientSegment[]

export function parseGradient(input: string): Gradient {

    const terms = []

    let acc = ''

    for(let i = 0; i < input.length; i++) {
        let char = input[i]

        if (char === ',') {
            terms.push(acc.trim())
            acc = ''
            i++
        }
    
        if (char === '(') {
            let notFoundCount = 0
            while (input[i] !== ')') {
                acc+=input[i]
                i++

                if(notFoundCount++ > 5000) {
                    throw new Error('incorect gradient')
                }
            }
        }

        acc+= input[i]
    }

    terms.push(acc.trim())
    
    return terms.map(t => {

        const res = /rgba\((\d+),(\d+),(\d+),([+-]?([0-9]*[.])?[0-9]+)\) +([+-]?([0-9]*[.])?[0-9]+)%/.exec(t)
        if (!res) {
            return undefined
        }

        return {
            color: [Number(res[1]), Number(res[2]), Number(res[3]), Number(res[4])] as const,
            ratio: Number(res[6]) / 100
        }
    }).filter(x => x)

}

export function lerpColor(a: Color, b: Color, ratio: number): Color {
    return [lerp(a[0], b[0], ratio), lerp(a[1], b[1], ratio), lerp(a[2], b[2], ratio), lerp(a[3], b[3], ratio)]
}


export function gradientColorAt(gradient: Gradient, ration: number) {

    let from: GradientSegment
    let to: GradientSegment
    for (let i = 0; i < gradient.length; i++) {
        if (ration < gradient[i].ratio) {
            from = gradient[i - 1]
            to = gradient[i]
            break;
        }
    }

    if (!from) {
        from = gradient[gradient.length - 2]
        to = gradient[gradient.length - 1]
    }

    // console.log(gradient, ration)

    const interpolateVal = (ration - from.ratio) / (to.ratio - from.ratio)

    return lerpColor(from.color, to.color, interpolateVal)

}


export type ColorAnimation = {
    gradients: { time: number, gradient: Gradient }[]
    currentIndex: number
    time: number
}

export function updateColorAnimation(animation: ColorAnimation, dt: number) {

    const gradientA = animation.gradients[animation.currentIndex]
    // const colorB = animation.gradients[animation.currentIndex + 1 % animation.gradients.length]

    animation.time += dt
    if (animation.time >= gradientA.time) {
        animation.time = 0
        animation.currentIndex = (animation.currentIndex + 1) % animation.gradients.length
    }

}

export function animationColorAt(animation: ColorAnimation, ration: number) {

    const gradientA = animation.gradients[animation.currentIndex]
    const gradientB = animation.gradients[(animation.currentIndex + 1) % animation.gradients.length]

    const colorA = gradientColorAt(gradientA.gradient, ration)
    const colorB = gradientColorAt(gradientB.gradient, ration)

    return lerpColor(colorA, colorB, animation.time / gradientA.time)

}