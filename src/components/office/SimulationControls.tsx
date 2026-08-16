import { FastForward, Pause, Play, RotateCcw } from "lucide-react";
import type { SimulationSpeed } from "@/domain/company/types";

export function SimulationControls({ speed, onSpeed, onReset }: { speed: SimulationSpeed; onSpeed: (speed: SimulationSpeed) => void; onReset: () => void }) {
  const speeds: SimulationSpeed[] = [0, 1, 2, 4];
  return (
    <div className="simulation-controls" aria-label="Simulation controls">
      <span className="control-label">SIMULATION</span>
      <div className="speed-buttons">
        {speeds.map((item) => <button className={speed === item ? "active" : ""} onClick={() => onSpeed(item)} key={item} title={item === 0 ? "Pause" : `${item}x speed`}>
          {item === 0 ? <Pause size={14} /> : item === 1 ? <Play size={13} /> : <FastForward size={13} />} {item === 0 ? "PAUSE" : `${item}x`}
        </button>)}
      </div>
      <button className="reset-button" onClick={onReset}><RotateCcw size={13} /> RESET</button>
    </div>
  );
}
