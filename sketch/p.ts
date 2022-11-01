import { CircularArray } from "./curcularArray";
import {
  animationColorAt,
  ColorAnimation,
  Gradient,
  gradientColorAt,
  parseGradient,
  updateColorAnimation,
} from "./gradient";
import { Vector } from "./vector";

import { consts } from "./ui";
import { makeNoise3D } from "open-simplex-noise";

const noise3D = makeNoise3D(Date.now());

let uid = 0;

interface Group {
  id: string;
  entities: Entity[];
  colorAnimation: ColorAnimation;
}

interface Entity {
  id: number;
  position: Vector;
  h: CircularArray;
  vel: Vector;
  livetime: number;
}

function randomEntity(): Entity {
  return {
    id: uid++,
    position: new Vector(random(0, windowWidth), random(0, windowHeight)),
    vel: new Vector(0, 0),
    h: new CircularArray(0),
    livetime: Infinity,
  };
}

function mouseEntity(): Entity {
  return {
    id: uid++,
    position: new Vector(mouseX, mouseY),
    vel: new Vector(0, 0),
    h: new CircularArray(0),
    livetime: Infinity,
  };
}

function randomEntityEdge(): Entity {
  const w = new Vector(random(0, windowWidth), random(0, windowHeight));
  if (Math.random() > 0.5) {
    w.x = Math.round(Math.random()) * windowWidth;
  } else {
    w.y = Math.round(Math.random()) * windowHeight;
  }

  return {
    id: uid++,
    position: w,
    vel: new Vector(0, 0),
    h: new CircularArray(0),
    livetime: Infinity,
  };
}

let groups: { [key: string]: Group } = {};

function updateGroup(group: Group) {
  while (group.entities.length < consts[group.id].amount) {
    if (consts[group.id].spawnLocation === "edge") {
      group.entities.push(randomEntityEdge());
    } else if (consts[group.id].spawnLocation === "mouse") {
      group.entities.push(mouseEntity());
      break;
    } else {
      group.entities.push(randomEntity());
    }
  }

  updateColorAnimation(group.colorAnimation, deltaTime);
  for (const e of group.entities) {
    e.h.length = consts[group.id].length;

    e.livetime -= deltaTime;

    if (e.livetime < 0) {
      e.h.pop();
      if (e.h.arr.length <= 0) {
        group.entities = group.entities.filter((x) => x !== e);
      }
      continue;
    }

    let n: number;

    if (consts[group.id].noiseType === "perlin") {
      n = noise(
        e.position.x * consts[group.id].noiseScale,
        e.position.y * consts[group.id].noiseScale,
        millis() * consts[group.id].noiseTimeScale
      );
      n = map(n, 0.25, 0.75, 0, 1);
    } else {
      n = noise3D(
        e.position.x * consts[group.id].noiseScale * 0.5,
        e.position.y * consts[group.id].noiseScale * 0.5,
        millis() * consts[group.id].noiseTimeScale
      );
    }

    const noiseVec = Vector.fromAngle(n * Math.PI * 2).multiply(3);

    // const seekVec = seek(e).multiply(0)
    const fellVec = flee(e).multiply(0);
    const seperationVec = seperation(e, group).multiply(100);

    const steering = noiseVec
      .add(seperationVec)
      .limit(consts[group.id].stearingThreshold);

    e.vel = e.vel
      .add(steering.multiply(deltaTime))
      .limit(consts[group.id].maxVelocity);

    e.position = e.position.add(e.vel.multiply(deltaTime));

    e.h.push(e.position);

    if (
      e.position.x < 0 ||
      e.position.y < 0 ||
      e.position.x > windowWidth ||
      e.position.y > windowHeight
    ) {
      e.livetime = -1;
    }
  }
}

// function seek(e: Entity) {
//     const target = new Vector(mouseX, mouseY)
//     const desiered = target.subtract(e.position).normalize().multiply((consts[].maxVelocity) * 10)
//     return desiered.subtract(e.vel)
// }

function flee(e: Entity) {
  const target = new Vector(mouseX, mouseY);
  const distance = e.position.distanceTo(target);

  const desiered = e.position.subtract(target).normalize();
  return desiered.divide(distance);
}

function seperation(e: Entity, group: Group) {
  let v = new Vector(0, 0);
  for (const ee of group.entities) {
    if (ee === e) {
      continue;
    }

    const distance = e.position.distanceTo(ee.position);
    const target = ee.position;

    v = v.add(
      e.position
        .subtract(target)
        .normalize()
        .divide(distance * distance)
    );
  }
  return v;
}

function drawGroup(group: Group) {
  strokeWeight(consts[group.id].width);
  strokeJoin(BEVEL);

  for (const e of group.entities) {
    let i = 0;
    let prev;
    for (const el of e.h) {
      if (prev) {
        const color = animationColorAt(group.colorAnimation, el.fraction);
        stroke(color[0], color[1], color[2]);

        line(prev.point.x, prev.point.y, el.point.x, el.point.y);
      }
      prev = el;
      i++;
    }
  }
}

(window as any).setup = function setup() {
  // seek = createVector(500, 500)

  createCanvas(windowWidth, windowHeight);

  const colorAnimation = {
    currentIndex: 0,
    time: 0,
    gradients: [
      {
        time: 8000,
        gradient: parseGradient(
          "90deg, rgba(0,0,0,1) 0%, rgba(10,0,208,1) 100%"
        ),
      },
      // { time: 8000, gradient: parseGradient('90deg, rgba(0,0,0,1) 0%, rgba(0,96,14,1) 100%') },
      // { time: 8000, gradient: parseGradient('90deg, rgba(0,0,0,1) 0%, rgba(250,250,0,1) 100%') },
      // { time: 5000, gradient: parseGradient('90deg, rgba(0,0,0,1) 0%, rgba(255,0,18,1) 100%') }
    ],
  };

  groups["#1"] = {
    entities: [],
    colorAnimation,
    id: "#1",
  };
};
(window as any).windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};
(window as any).draw = function draw() {
  background(0);

  for (const group of Object.values(groups)) {
    updateGroup(group);
    drawGroup(group);
  }

  //    noStroke()
  //    fill(255)
  //    textSize(15)
  //    text('velocity', 150, 23)
  //    text('stearing', 150, 53)
  //    text('noise magnitude', 150, 53 + 30)
  //    text('noise scale', 150, 53 + 60)
};
