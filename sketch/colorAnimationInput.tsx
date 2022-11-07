import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { ColorAnimation, Gradient } from "./gradient";
import { GradientPicker } from "./grapic";

const toCssGradient = (gradient: Gradient) => {
  if (gradient) {
    return `linear-gradient(90deg, ${gradient
      .map(
        (x) =>
          `rgba(${x.color[0]}, ${x.color[1]}, ${x.color[2]}, ${x.color[3]}) ${
            x.ratio * 100
          }%`
      )
      .join(",")})`;
  } else {
    return "black";
  }
};

export function ColorAnimationInput({
  animation,
  onChange,
}: {
  animation: ColorAnimation;
  onChange: (an: ColorAnimation) => void;
}) {
  const [openedIndex, setOpenedIndex] = useState(null);

  return (
    <div class="color-animation-input">
      <div>Color</div>
      {animation.gradients.map((x, i) => (
        <div class="gradint-input" style={{ marginBottom: 1 }} key={i}>
          <div
            onClick={() => setOpenedIndex(i)}
            class="gradient-icon"
            style={{
              background: toCssGradient(x.gradient),
            }}
          ></div>

          <input
            type="number"
            value={x.time}
            onChange={(e) => {
              onChange({
                ...animation,
                gradients: Object.assign([], animation.gradients, {
                  [i]: { ...x, time: (e.target as any).valueAsNumber },
                }),
              });
            }}
          />
          <span
            class="clickable material-icons"
            onClick={() => {
              onChange({
                ...animation,
                gradients: animation.gradients.filter((_, ii) => i !== ii),
              });
              setOpenedIndex(null);
            }}
          >
            close
          </span>
          {openedIndex === i && (
            <GradientPicker
              gradient={animation.gradients[openedIndex].gradient}
              onClickOutside={() => setOpenedIndex(null)}
              key={openedIndex}
              onChange={(e) => {
                onChange({
                  ...animation,
                  gradients: Object.assign([], animation.gradients, {
                    [openedIndex]: {
                      ...animation.gradients[openedIndex],
                      gradient: e,
                    },
                  }),
                });
              }}
            />
          )}
        </div>
      ))}

      <span
        class="clickable material-icons-outlined"
        style={{ fontSize: "34px" }}
        onClick={() =>
          onChange({
            ...animation,
            gradients: [
              ...animation.gradients,
              {
                gradient: [
                  { color: [0, 0, 0, 1], ratio: 0 },
                  { color: [255, 255, 255, 1], ratio: 1 },
                ],
                time: 8000,
              },
            ],
          })
        }
      >
        add_box
      </span>
    </div>
  );
}
