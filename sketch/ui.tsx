import { render, h } from "preact";
import { useState } from "preact/hooks";
import { ColorAnimationInput } from "./colorAnimationInput";
import { ColorAnimation, parseGradient } from "./gradient";
import { NumberInput } from "./numberInput";
import { groups } from "./p";

let groupId = 0;

type Consts = {
  stearingThreshold: number;
  maxVelocity: number;
  noiseScale: number;
  noiseTimeScale: number;
  width: number;
  length: number;
  amount: number;
  spawnLocation: "edge" | "anyware" | "mouse";
  noiseType: "perlin" | "simplex";
  color: ColorAnimation;
  selectedGradientIndex: number | null;
  avoidEdges: number;
  seperationGroup: string;
  seperationValue: number;
  followGroup: string;
  followValue: number;
};

export let consts: { [key: string]: Consts };

function Group({
  onGroupState,
  groupState,
  groups,
}: {
  groupState: Consts;
  groups: string[];
  onGroupState: (consts: Consts) => void;
}) {
  return (
    <div>
      <div>
        <NumberInput
          label="acceleration"
          value={groupState.stearingThreshold}
          onChange={(v) =>
            onGroupState({ ...groupState, stearingThreshold: v })
          }
          max={10}
          min={0.0005}
          logaritmic={true}
        />
      </div>
      <div>
        <NumberInput
          label="max velocity"
          value={groupState.maxVelocity}
          onChange={(v) => onGroupState({ ...groupState, maxVelocity: v })}
          max={2}
          min={0.05}
        />
      </div>

      <div>
        <NumberInput
          label="noise scale"
          value={groupState.noiseScale}
          onChange={(v) => onGroupState({ ...groupState, noiseScale: v })}
          max={0.2}
          min={0.00001}
          logaritmic={true}
        />
      </div>

      <div>
        <NumberInput
          label="noise time scale"
          value={groupState.noiseTimeScale}
          onChange={(v) => onGroupState({ ...groupState, noiseTimeScale: v })}
          max={(1 / 9000) * 10}
          min={1 / 9000 / 20}
          logaritmic={true}
        />
      </div>

      <div>
        <NumberInput
          label="avoid edges"
          value={groupState.avoidEdges}
          onChange={(v) => onGroupState({ ...groupState, avoidEdges: v })}
          max={2000}
          min={0}
        />
      </div>

      <div>
        <NumberInput
          label="width"
          value={groupState.width}
          onChange={(v) => onGroupState({ ...groupState, width: v })}
          max={20}
          min={0.2}
        />
      </div>

      <div>
        <NumberInput
          label="length"
          value={groupState.length}
          onChange={(v) => onGroupState({ ...groupState, length: v })}
          max={500}
          min={5}
          integer={true}
        />
      </div>

      <div>
        <NumberInput
          label="amount"
          value={groupState.amount}
          onChange={(v) => onGroupState({ ...groupState, amount: v })}
          max={3000}
          min={1}
          integer={true}
        />
      </div>

      <div>
        <NumberInput
          label=""
          disabled={!groupState.seperationGroup}
          value={groupState.seperationValue}
          onChange={(v) => onGroupState({ ...groupState, seperationValue: v })}
          max={10000}
          min={1}
        >
          <span>seperation</span>
          <select
            value={groupState.seperationGroup}
            onChange={(event) =>
              onGroupState({
                ...groupState,
                seperationGroup: (event.target as any).value,
              })
            }
          >
            <option value="">none</option>
            {groups.map((x) => (
              <option value={x}>#{x}</option>
            ))}
          </select>
        </NumberInput>
      </div>

      <div>
        <NumberInput
          label=""
          disabled={!groupState.followGroup}
          value={groupState.followValue}
          onChange={(v) => onGroupState({ ...groupState, followValue: v })}
          max={10000}
          min={1}
        >
          <span>follow</span>
          <select
            value={groupState.followGroup}
            onChange={(event) =>
              onGroupState({
                ...groupState,
                followGroup: (event.target as any).value,
              })
            }
          >
            <option value="">none</option>
            {groups.map((x) => (
              <option value={x}>#{x}</option>
            ))}
          </select>
        </NumberInput>
      </div>

      <div>
        <span>spawn</span>
        <select
          value={groupState.spawnLocation}
          onChange={(event) =>
            onGroupState({
              ...groupState,
              spawnLocation: (event.target as any).value,
            })
          }
        >
          <option value="edge">on edge</option>
          <option value="anyware">anyware</option>
          <option value="mouse">mouse</option>
        </select>
      </div>

      <div>
        <span>noise function</span>
        <select
          value={groupState.noiseType}
          onChange={(event) =>
            onGroupState({
              ...groupState,
              noiseType: (event.target as any).value,
            })
          }
        >
          <option value="perlin">perlin</option>
          <option value="simplex">simplex</option>
        </select>
      </div>
      <ColorAnimationInput
        animation={groupState.color}
        onChange={(e) => {
          onGroupState({ ...groupState, color: e });
        }}
      />
    </div>
  );
}

function defaultGroupConsts(): Consts {
  return {
    stearingThreshold: 0.003,
    maxVelocity: 0.5,
    noiseScale: 1 / 500,
    noiseTimeScale: 1 / 9000,
    width: 4,
    length: 100,
    amount: 200,
    spawnLocation: "edge",
    noiseType: "perlin",
    color: {
      gradients: [
        {
          time: 8000,
          gradient: parseGradient("rgba(0,0,0,1) 0%, rgba(10,0,208,1) 100%"),
        },
      ],
      currentIndex: 0,
      time: 0,
    },
    selectedGradientIndex: null,
    avoidEdges: 0,
    seperationGroup: "",
    seperationValue: 0,
    followGroup: "",
    followValue: 0,
  };
}

const debounceEvent = (callback: any, time: number) => {
  let interval: number;
  return (...args: any[]) => {
    clearTimeout(interval);
    interval = setTimeout(() => {
      interval = null;
      callback(...args);
    }, time);
  };
};

const setUrl = debounceEvent((state: any) => {
  document.location.hash = JSON.stringify(state);
}, 100);

const initialState = (() => {
  try {
    return JSON.parse(decodeURIComponent(document.location.hash.slice(1)));
  } catch {
    return { "1": defaultGroupConsts() };
  }
})();

setTimeout(() => {
  for (const key in initialState) {
    groups[key] = { entities: [], id: key };
  }
  groupId = Math.max(...Object.keys(groups).map(Number), 0) + 1;
});

function App() {
  const [state, setState] = useState(initialState as { [key: string]: Consts });
  const [hidden, setHidden] = useState(false);

  consts = state;
  setUrl(state);

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ display: hidden ? "none" : "block", overflow: "auto" }}>
        {Object.entries(state).map(([key, group]) => (
          <div class="group">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 17, fontWeight: 700 }}>#{key}</span>
              <span
                class="material-icons clickable"
                onClick={() => {
                  const newState = { ...state };
                  delete newState[key];
                  setState(newState);
                  delete groups[key];
                }}
              >
                clear
              </span>
            </div>
            <Group
              groups={Object.keys(state)}
              groupState={group}
              onGroupState={(newState) =>
                setState({ ...state, [key]: newState })
              }
            />
          </div>
        ))}
        <span
          class="material-icons-outlined"
          onClick={() => {
            const id = `${groupId++}`;
            setState({ ...state, [id]: defaultGroupConsts() });
            groups[id] = {
              entities: [],
              id,
            };
          }}
        >
          library_add
        </span>
      </div>
      <div>
        <span
          onClick={() => {
            setHidden(!hidden);
          }}
          class="material-icons clickable"
          style={{ transform: hidden ? "" : "rotate(180deg)" }}
        >
          arrow_forward
        </span>
      </div>
    </div>
  );
}

render(<App />, document.getElementById("ui"));
