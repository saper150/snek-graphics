import * as PIXI from 'pixi.js'
import { flowForPoint } from './flow';


// import './webgl'

function lerp(v0: number, v1: number, t: number) {
    return v0 * (1 - t)+ v1 * t
}



const app = new PIXI.Application({
    antialias: true,
    width: data.width,
    height: data.height
})



document.body.appendChild(app.view)

let elapsedTime = 0.0;
let deltaTime = 0

let pTimer = 0;

const particles: Particle[] = []


app.ticker.add((delta) => {
    deltaTime = app.ticker.deltaMS
    elapsedTime += deltaTime
    
    pTimer += deltaTime

    while(pTimer > 100) {
        particles.push(createParticle())
        pTimer -= 100
    }

    if(particles.length === 0) {
        particles.push(createParticle())
    }

    let i = particles.length
    while (i--) {

        const particle = particles[i]

        if(particle.dying) {

            particle.points[0].graphics.destroy()
            particle.points.shift()

            if (particle.points.length <= 1) {
                particle.points[0].graphics.destroy()
                particles.splice(i, 1)
                continue
            }
        }

        if(!particle.dying) {
            advanceParticle(particle)
        }

    }

    drawField()

});




type Particle = ReturnType<typeof createParticle>



const particleLiveTime = 7000
const particleLength = 200
const velocity = 0.1
const acceleration = 0.05
const maxVelocity = 5

const color1 = [251, 102, 0]
const color2 = [0, 167, 199]

function lerpColor(a: number[], b: number[], t: number) {
    if (t >= 1) {
        return PIXI.utils.rgb2hex([b[0]/255, b[1]/255, b[2] / 255])
    }
    return PIXI.utils.rgb2hex([
        lerp(a[0], b[0], t) / 255,
        lerp(a[1], b[1], t) / 255,
        lerp(a[2], b[2], t) / 255
    ])
}

function createParticle() {
    return {
        dying: false,
        velocity: { x: 0, y: 0 },
        createdAt: elapsedTime,
        points: [{
            time: 0,
            x: Math.random() * app.view.width,
            y: Math.random() * app.view.height,
            graphics: new PIXI.Graphics(),
        }]
    }
}

function advanceParticle(particle: Particle) {
    const lastPoint = particle.points[particle.points.length - 1]
    const {x, y} = flowForPoint(lastPoint.x, lastPoint.y, elapsedTime)

    const line = new PIXI.Graphics()

    const c = lerpColor(color1, color2, (elapsedTime - particle.createdAt) / particleLiveTime)
    line.beginFill(c)

    line.lineStyle({ width: 2, color: c })
    line.moveTo(lastPoint.x, lastPoint.y)
    line.lineTo(lastPoint.x + x * deltaTime * velocity, lastPoint.y + y * deltaTime * velocity)

    app.stage.addChild(line)

    const point = {
        time: elapsedTime - particle.createdAt,
        x: lastPoint.x + x * deltaTime * velocity,
        y: lastPoint.y + y * deltaTime * velocity,
        graphics: line
    }


    if (point.x > app.view.width || point.x < 0 || point.y > app.view.height || point.y < 0 || particle.points.length > 400) {
        particle.dying = true
    }

    particle.points.push(point)

    // if (aliveFor >= particleLength / velocity) {
    //     particle.points.shift()
    // }

}




const white = PIXI.utils.rgb2hex([1, 1, 1])
const g = new PIXI.Graphics()
g.beginFill(white)
app.stage.addChild(g)


function drawField() {
    g.clear()
    const numberOfSteps = 30
    const stepSize = app.view.width / numberOfSteps
    const halfStep = stepSize / 2

    for(let i = 0; i< numberOfSteps; i++) {
        for(let j = 0; j< numberOfSteps; j++) {

            
            const pointx = i * stepSize + halfStep
            const pointy = j * stepSize + halfStep

            g.drawCircle(pointx, pointy, 4);

            
            let { x, y } = flowForPoint(pointx, pointy, elapsedTime)
            x *= 10
            y *= 10
            g.lineStyle({ width: 1, color:white })
            g.moveTo(pointx, pointy) 
            g.lineTo(pointx + x, pointy + y)

            // line(pointx, pointy, pointx + x, pointy + y)

        }
    }
}


// function drawParticle(particle: Particle) {
//     for(let i = 0; i < particle.points.length - 1; i++) {
//         const c = lerpColor(color1, color2, particle.points[i].time / particleLiveTime)
//         stroke(c)
//         line(particle.points[i].x, particle.points[i].y, particle.points[i + 1].x, particle.points[i+ 1].y)
//     }
// }

function vectorLength({x, y}: { x: number, y: number }) {
    return Math.sqrt(x*x + y*y)
}

function normalVector({x, y}: { x: number, y: number }) {
    const len = vectorLength({ x, y })
    return { x: x/len, y: y/ len }
}






// let timer = 0
// function draw() {

//     const now = millis()

//     background(0);

//     // drawField()

//     particles.push(createParticle())
//     // particles.push(createParticle())

//     // if (millis() >= 0 + timer) {
//     //     timer = millis();
//     // }

//     var i = particles.length
//     while (i--) {

//         const particle = particles[i]

//         if(particle.dying) {
//             particle.points.shift()
//             if (particle.points.length <= 1) {
//                 particles.splice(i, 1)
//                 continue
//             }
//         }

//         // if(now - particle.createdAt > particleLiveTime) {
//         //     particle.dying = true
//         // }

//         if(!particle.dying) {
//             advanceParticle(particle)
//         }

//         stroke(251, 102, 0);
//         stroke(0, 167, 199);
//         drawParticle(particle)

//     }

// }
// window.draw = draw
// window.setup = setup