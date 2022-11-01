import { render, h, } from "preact"
import { useState } from 'preact/hooks';

function NumberInput({ label, onChange, value, max, min, logaritmic }:
  { value: number, label: string, onChange: (number: number) => void, max: number, min: number, logaritmic?: boolean }) {

  if (logaritmic) {
    const linear = value / (max - min)
    var minp = 0;
    var maxp = 1;

    var minv = Math.log(min);
    var maxv = Math.log(max);
    var scale = (maxv - minv) / (maxp - minp);

    const change = (v: number) => {

      onChange(Math.exp(minv + scale * (v - minp)))

    }

    const v = (Math.log(value) - minv) / scale + minp

    return <div class="number-input">
      <div>
        {label}
      </div>
      <div>
        <input type="range" step="any" value={v} onInput={(event) => change((event.target as any).valueAsNumber)} max={1} min={0} />
        <input type="number" value={value} onInput={(event) => change((event.target as any).value)} />
      </div>
    </div>


  }

  return <div class="number-input">
    <div>
      {label}
    </div>
    <div>
      <input type="range" step="any" value={value} onInput={(event) => onChange((event.target as any).valueAsNumber)} max={max} min={min} />
      <input type="number" value={value} onInput={(event) => onChange((event.target as any).value)} />
    </div>
  </div>
}


type Consts = {
  stearingThreshold: number,
  maxVelocity: number,
  noiseScale: number,
  noiseTimeScale: number,
  width: number,
  length: number,
  amount: number,
  spawnLocation: 'edge' | 'anyware' | 'mouse',
  noiseType: 'perlin' | 'simplex',
  gradients: 
}

export let consts: { [key: string]: Consts }


function Group({ onGroupState, groupState }: { groupState: Consts, onGroupState: (consts: Consts) => void }) {

  return <div class="group">
    <div>
      <NumberInput
        label="acceleration"
        value={groupState.stearingThreshold}
        onChange={v => onGroupState({ ...groupState, stearingThreshold: v })}
        max={10}
        min={0.0005}
        logaritmic={true}
      />
    </div>
    <div>
      <NumberInput
        label="max velocity"
        value={groupState.maxVelocity}
        onChange={v => onGroupState({ ...groupState, maxVelocity: v })}
        max={2}
        min={0.05}
      />
    </div>

    <div>
      <NumberInput
        label="noise scale"
        value={groupState.noiseScale}
        onChange={v => onGroupState({ ...groupState, noiseScale: v })}
        max={0.2}
        min={0.00001}
        logaritmic={true}
      />
    </div>

    <div>
      <NumberInput
        label="noise time scale"
        value={groupState.noiseTimeScale}
        onChange={v => onGroupState({ ...groupState, noiseTimeScale: v })}
        max={1 / 9000 * 10}
        min={1 / 9000 / 20}
        logaritmic={true}
      />
    </div>

    <div>
      <NumberInput
        label="width"
        value={groupState.width}
        onChange={v => onGroupState({ ...groupState, width: v })}
        max={20}
        min={0.2}
      />
    </div>

    <div>
      <NumberInput
        label="length"
        value={groupState.length}
        onChange={v => onGroupState({ ...groupState, length: v })}
        max={500}
        min={5}
      />
    </div>

    <div>
      <NumberInput
        label="amount"
        value={groupState.amount}
        onChange={v => onGroupState({ ...groupState, amount: v })}
        max={3000}
        min={1}
      />
    </div>

    <div>
      <span>
        spawn
      </span>
      <select value={groupState.spawnLocation} onChange={event => onGroupState({ ...groupState, spawnLocation: (event.target as any).value })}>
        <option value="edge">on edge</option>
        <option value="anyware">anyware</option>
        <option value="mouse">mouse</option>
      </select>
    </div>

    <div>
      <span>
        noise function
      </span>
      <select value={groupState.noiseType} onChange={event => onGroupState({ ...groupState, noiseType: (event.target as any).value })}>
        <option value="perlin">perlin</option>
        <option value="simplex">simplex</option>
      </select>
    </div>


    <div>
      <button onClick={() => onGroupState({ ...groupState, gradients: [...groupState.gradients, { time: 8000, gradient: '90deg, rgba(0,0,0,1) 0%, rgba(10,0,208,1) 100%' }] })}>add gradient</button>

      {groupState.gradients.map(({ gradient, time }) => <div>
        <input type="text" value={gradient} />
        <input type="number" value={time} />
      </div>)}
    </div>



  </div>

}

function App() {

  const [state, setState] = useState({
    '#1': {
      stearingThreshold: 0.003,
      maxVelocity: 0.5,
      noiseScale: 1 / 500,
      noiseTimeScale: 1 / 9000,
      width: 4,
      length: 100,
      amount: 200,
      spawnLocation: 'edge',
      noiseType: 'perlin',
      gradient: [{ time: 8000, gradient: '90deg, rgba(0,0,0,1) 0%, rgba(10,0,208,1) 100%' }],
      animation: null
    } as Consts
  })

  const [uiState, setUiState] = useState({
    gradients: []
  })


  consts = state


  return <div>
    {Object.entries(state).map(([key, group]) =>
      <Group groupState={group} onGroupState={newState => setState({ ...state, [key]: newState })} />
    )}
  </div>

}




render(<App />, document.getElementById('ui'));

