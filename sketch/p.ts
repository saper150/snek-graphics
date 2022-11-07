import { CircularArray } from "./curcularArray";
import { animationColorAt, updateColorAnimation } from "./gradient";
import { Vector } from "./vector";

import { consts } from "./ui";
import { makeNoise3D } from "open-simplex-noise";

import "../style.css";

const noise3D = makeNoise3D(Date.now());

let uid = 0;

interface Group {
  id: string;
  entities: Entity[];
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

export let groups: { [key: string]: Group } = {};

function updateGroup(group: Group) {
  const groupConsts = consts[group.id];

  while (group.entities.length < groupConsts.amount) {
    if (groupConsts.spawnLocation === "edge") {
      group.entities.push(randomEntityEdge());
    } else if (groupConsts.spawnLocation === "mouse") {
      group.entities.push(mouseEntity());
      break;
    } else {
      group.entities.push(randomEntity());
    }
  }

  while (group.entities.length > groupConsts.amount) {
    group.entities.pop();
  }

  updateColorAnimation(groupConsts.color, deltaTime);

  for (const e of group.entities) {
    e.h.length = groupConsts.length;

    e.livetime -= deltaTime;

    if (e.livetime < 0) {
      e.h.pop();
      if (e.h.arr.length <= 0) {
        group.entities = group.entities.filter((x) => x !== e);
      }
      continue;
    }

    let n: number;

    if (groupConsts.noiseType === "perlin") {
      n = noise(
        e.position.x * groupConsts.noiseScale,
        e.position.y * groupConsts.noiseScale,
        millis() * groupConsts.noiseTimeScale
      );
      n = map(n, 0.25, 0.75, 0, 1);
    } else {
      n = noise3D(
        e.position.x * groupConsts.noiseScale * 0.5,
        e.position.y * groupConsts.noiseScale * 0.5,
        millis() * groupConsts.noiseTimeScale
      );
    }

    const noiseVec = Vector.fromAngle(n * Math.PI * 2).multiply(3);

    // const seekVec = seek(e).multiply(0)
    const fellVec = flee(e).multiply(0);
    const avoidEdgesVec = avoidEdges(e).multiply(groupConsts.avoidEdges);

    let seperationVec = new Vector();
    if (groups[groupConsts.seperationGroup]) {
      seperationVec = seperation(
        e,
        groups[groupConsts.seperationGroup]
      ).multiply(groupConsts.seperationValue);
    }

    const steering = noiseVec
      .add(avoidEdgesVec)
      .add(seperationVec)
      .limit(groupConsts.stearingThreshold);

    e.vel = e.vel
      .add(steering.multiply(deltaTime))
      .limit(groupConsts.maxVelocity);

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

    if (e.livetime < 0) {
      e.h.pop();
      if (e.h.arr.length <= 0) {
        group.entities = group.entities.filter((x) => x !== e);
      }
      continue;
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
        const color = animationColorAt(consts[group.id].color, el.fraction);
        stroke(color[0], color[1], color[2]);

        line(prev.point.x, prev.point.y, el.point.x, el.point.y);
      }
      prev = el;
      i++;
    }
  }
}

function avoidEdges(e: Entity) {
  const topDistance = e.position.y;
  const bottomDistance = windowHeight - e.position.y;
  const leftDistance = e.position.x;
  const rightDistance = windowWidth - e.position.x;

  const threshold = 100;

  let v = new Vector(0, 0);

  if (topDistance > threshold) {
    v.y += 1 / topDistance;
  }

  if (bottomDistance > threshold) {
    v.y -= 1 / bottomDistance;
  }

  if (leftDistance > threshold) {
    v.x += 1 / leftDistance;
  }

  if (rightDistance > threshold) {
    v.x -= 1 / rightDistance;
  }

  return v;
}

(window as any).setup = function setup() {
  createCanvas(windowWidth, windowHeight);
};
(window as any).windowResized = function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};
(window as any).draw = function draw() {
  background(0);

  for (const group of Object.values(groups)) {
    if (!consts[group.id]) {
      continue;
    }
    updateGroup(group);
    drawGroup(group);
  }
};
