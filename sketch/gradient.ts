import parse from "parse-css-color";

export type Color = readonly [number, number, number, number];
export type GradientSegment = { color: Color; ratio: number };
export type Gradient = GradientSegment[];

export function parseGradient(input: string): Gradient {
  const terms = [];

  let acc = "";

  for (let i = 0; i < input.length; i++) {
    let char = input[i];

    if (char === ",") {
      terms.push(acc.trim());
      acc = "";
      i++;
    }

    if (char === "(") {
      let notFoundCount = 0;
      while (input[i] !== ")") {
        acc += input[i];
        i++;

        if (notFoundCount++ > 5000) {
          throw new Error("incorect gradient");
        }
      }
    }

    acc += input[i];
  }

  terms.push(acc.trim());
  return terms
    .filter((x) => x)
    .map((t) => {
      let res = /(.*) +([+-]?([0-9]*[.])?[0-9]+)%/.exec(t);
      const parsed = parse(res[1]);
      return {
        color: [...parsed.values, parsed.alpha] as any,
        ratio: parseFloat(res[2]) / 100,
      };
    });
}

export function lerpColor(a: Color, b: Color, ratio: number): Color {
  return [
    lerp(a[0], b[0], ratio),
    lerp(a[1], b[1], ratio),
    lerp(a[2], b[2], ratio),
    lerp(a[3], b[3], ratio),
  ];
}

export function gradientColorAt(gradient: Gradient, ration: number) {
  let from: GradientSegment;
  let to: GradientSegment;

  for (let i = 0; i < gradient.length; i++) {
    if (ration < gradient[i].ratio) {
      from = gradient[i - 1];
      to = gradient[i];
      break;
    }
  }

  if (!from) {
    from = gradient[gradient.length - 2];
    to = gradient[gradient.length - 1];
  }

  if (gradient.length === 1) {
    from = gradient[0];
    to = gradient[0];
  }

  if (gradient.length === 0) {
    return [0, 0, 0, 0] as Color;
  }

  const interpolateVal = (ration - from.ratio) / (to.ratio - from.ratio);

  return lerpColor(from.color, to.color, interpolateVal);
}

export type ColorAnimation = {
  gradients: { time: number; gradient: Gradient }[];
  currentIndex: number;
  time: number;
};

export function updateColorAnimation(animation: ColorAnimation, dt: number) {
  const gradients = animation.gradients.filter((x) => x.gradient);
  if (gradients.length === 0) {
    return;
  }

  animation.currentIndex = Math.min(
    gradients.length - 1,
    animation.currentIndex
  );

  const gradientA = gradients[animation.currentIndex];
  // const colorB = gradients[animation.currentIndex + 1 % gradients.length]

  animation.time += dt;
  if (animation.time >= gradientA.time) {
    animation.time = 0;
    animation.currentIndex = (animation.currentIndex + 1) % gradients.length;
  }
}

export function animationColorAt(animation: ColorAnimation, ration: number) {
  const gradients = animation.gradients.filter((x) => x.gradient);
  if (gradients.length === 0) {
    return [0, 0, 0, 0];
  }
  const gradientA = gradients[animation.currentIndex % gradients.length];

  const gradientB = gradients[(animation.currentIndex + 1) % gradients.length];

  const colorA = gradientColorAt(gradientA.gradient, ration);
  const colorB = gradientColorAt(gradientB.gradient, ration);

  return lerpColor(colorA, colorB, animation.time / gradientA.time);
}
