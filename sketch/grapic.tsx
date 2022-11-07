import Grapick from "grapick/dist/grapick.min.js";
import { h } from "preact";
import { useCallback, useEffect, useRef } from "preact/hooks";
import "grapick/dist/grapick.min.css";
import { Gradient, parseGradient } from "./gradient";

function useOutsideAlerter(ref: any, callback: () => void) {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

export function GradientPicker({
  onChange,
  gradient,
  onClickOutside,
}: {
  onChange: (gradient: Gradient) => void;
  onClickOutside: () => void;
  gradient: Gradient;
}) {
  const gradientPickerRef = useRef(null);
  useOutsideAlerter(gradientPickerRef, onClickOutside);

  const r = useCallback((divRef: HTMLDivElement) => {
    if (!divRef) {
      return;
    }

    const gp = new Grapick({ el: divRef });
    for (const e of gradient || []) {
      gp.addHandler(
        e.ratio * 100,
        `rgba(${e.color[0]},${e.color[1]},${e.color[2]},${e.color[3]})`
      );
    }

    gp.on("change", () => {
      onChange(parseGradient(gp.getColorValue()));
    });
  }, []);

  return (
    <div ref={gradientPickerRef} class="gradient-picker">
      <div ref={r} />
    </div>
  );
}
