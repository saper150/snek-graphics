import SimplexNoise from 'simplex-noise';

interface LineSegmentPoint {
    x: number
    y: number
    angle: number
}

const noise = new SimplexNoise()
const frequency = 2
const velocity = 0.02

function lerp(v0: number, v1: number, t: number) {
    return v0 * (1 - t)+ v1 * t
}

function compileShader(gl: WebGLRenderingContext, shaderSource: string, shaderType: number) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
      throw "could not compile shader:" + gl.getShaderInfoLog(shader);
    }
    return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        throw ("program failed to link:" + gl.getProgramInfoLog (program));
    }
   
    return program;
};


const vertexShader = `
precision mediump float;
attribute vec4 index;
attribute vec4 points;
varying float t;

void main () {

    vec2 p = vec2(1.5, 1.0);

    float top = index[0];
    float bottom = index[1];
    float back = index[2];
    float front = index[3];

    vec2 dir = normalize(points.xy - points.zw);

    t = top;

    vec2 perp;
    if (top > 0.9) {
        perp = vec2(-dir.y, dir.x);
    } else {
        perp = vec2(dir.y, -dir.x);
    }

    // vec2 perp = vec2(dir.y * -1.0 * bottom, dir.x * -1.0 * top);

    vec2 startPoint = (points.xy * back) + (points.zw * front);
    
    vec2 ee = startPoint + perp * 0.03;

    gl_Position = vec4(ee * p, 0.0, 1.0);
}
`

const fragmentShader = `
precision mediump float;
varying float t;
void main () {
    float max = 0.2;
    float min = 0.0;
    float alpha = smoothstep(min, max, t) * (1.0 - smoothstep(1.0 - max, 1.0 - min, t));

    gl_FragColor = vec4(251.0 / 255.0, 102.0 / 255.0, 0.0, alpha); // r,g,b,a
}
`



let elapsedTime = 0.0;
let deltaTime = 0;

const points: LineSegmentPoint[] = [{x: 0, y: 0, angle: 0}, {x: 0, y: 0, angle: 0}]

function main() {
    const canvas = document.querySelector("#glCanvas") as HTMLCanvasElement
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: true });
    const ext = gl.getExtension('ANGLE_instanced_arrays');

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // gl.colorMask(false, false, false, true);

    if (gl === null) {
      alert("Unable to initialize WebGL. Your browser or machine may not support it.");
      return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const program = createProgram(
        gl,
        compileShader(gl, vertexShader, gl.VERTEX_SHADER),
        compileShader(gl, fragmentShader, gl.FRAGMENT_SHADER),
    )

    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            1, 0, 1, 0, // top, bottom, back, front
            0, 1, 1, 0, // direction, back, front
            1, 0, 0, 1, // direction, back, front

            1, 0, 0, 1, // direction, back, front
            0, 1, 0, 1, // direction, back, front
            0, 1, 1, 0, // direction, back, front
        ]),
        gl.STATIC_DRAW
      )

    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    const position = gl.getAttribLocation(program, 'index')
    const pointsPos = gl.getAttribLocation(program, 'points')

    gl.enableVertexAttribArray(position)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    gl.vertexAttribPointer(
      position, // Location of the vertex attribute
      4, // Dimension - 2D
      gl.FLOAT, // Type of data we are going to send to GPU
      false, // If data should be normalized
      0, // Stride
      0 // Offset
    )

    const lineBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0, 0.1, 0.1,
        0.0, 0.0, 0.0, 0.1
    ]), gl.DYNAMIC_DRAW)

    gl.enableVertexAttribArray(pointsPos);

    gl.vertexAttribPointer(
        pointsPos,  // location
        4,            // size (num values to pull from buffer per iteration)
        gl.FLOAT,     // type of data in buffer
        false,        // normalize
        0,            // stride (0 = compute from size and type above)
        0,            // offset in buffer
    );
    ext.vertexAttribDivisorANGLE(pointsPos, 1);

    const startTime = performance.now()
    let lastTime = startTime
    function draw() {
        const now = performance.now()
        elapsedTime = now - startTime

        deltaTime = now - lastTime
        lastTime = now

        const prevPoint = points[points.length - 2]
        const lastPoint = points[points.length - 1]
        const noise = noiseForPoint(lastPoint.x, lastPoint.y)

        const newPoint = {
            x: lastPoint.x + noise.x * velocity,
            y: lastPoint.y + noise.y * velocity,
            angle: 0,
        }
        newPoint.angle = angleBetween(prevPoint, lastPoint, newPoint)

        points.push(newPoint)

        const res = []
        for(let i = 0; i < points.length - 1; i++) {
            res.push(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y)
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(res), gl.DYNAMIC_DRAW)

        gl.clear(gl.COLOR_BUFFER_BIT);
        ext.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, points.length);
        requestAnimationFrame(draw)
    }

    draw()

}

function angleBetween(point1: { x: number, y: number }, point2: { x: number, y: number }, point3: { x: number, y: number }) {
    const a = Math.atan2(point1.y - point2.y, point1.x - point2.x)
    const b = Math.atan2(point3.y - point2.y, point3.x - point2.x)
    return b - a
}

const res = angleBetween({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 })

console.log(res * 57.2958)


main()


function noiseForPoint(x: any, y: any) {
    const angle = noise.noise3D(x * frequency, y * frequency, elapsedTime / 50000) * Math.PI * 3
    return { x: Math.cos(angle), y: Math.sin(angle) }
}