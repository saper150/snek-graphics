import { ComponentChildren, h } from "preact";

export function NumberInput({
  label,
  onChange,
  value,
  max,
  min,
  logaritmic,
  disabled,
  children,
  integer,
}: {
  value: number;
  label: string;
  onChange: (number: number) => void;
  max: number;
  min: number;
  logaritmic?: boolean;
  disabled?: boolean;
  children?: ComponentChildren;
  integer?: boolean;
}) {
  if (logaritmic) {
    var minp = 0;
    var maxp = 1;

    var minv = Math.log(min);
    var maxv = Math.log(max);
    var scale = (maxv - minv) / (maxp - minp);

    const change = (v: number) => {
      onChange(Math.exp(minv + scale * (v - minp)));
    };

    const v = (Math.log(value) - minv) / scale + minp;

    return (
      <div class="number-input">
        <div>
          {label}
          {children}
        </div>
        <div class="input-container">
          <input
            disabled={disabled}
            type="range"
            step={integer ? "1" : "any"}
            value={v}
            onInput={(event) => change((event.target as any).valueAsNumber)}
            max={1}
            min={0}
          />
          <input
            disabled={disabled}
            type="number"
            value={Number((value || 0).toFixed(5))}
            onInput={(event) => change((event.target as any).valueAsNumber)}
          />
        </div>
      </div>
    );
  }

  return (
    <div class="number-input">
      <div>
        {label}
        {children}
      </div>
      <div class="input-container">
        <input
          disabled={disabled}
          type="range"
          step={integer ? "1" : "any"}
          value={value}
          onInput={(event) => onChange((event.target as any).valueAsNumber)}
          max={max}
          min={min}
        />
        <input
          disabled={disabled}
          type="number"
          value={Number((value || 0).toFixed(5))}
          onInput={(event) => onChange((event.target as any).valueAsNumber)}
        />
      </div>
    </div>
  );
}
