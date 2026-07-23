import { createContext, useContext } from 'react'
import { createPortal } from 'react-dom'

// Shared workspace context for all simulator components
export const WorkspaceContext = createContext({ inputsTarget: null, resultsTarget: null })

export function WorkspacePortal({ target, children }) {
  const { inputsTarget, resultsTarget } = useContext(WorkspaceContext)
  const dest = target === 'inputs' ? inputsTarget : resultsTarget
  return dest ? createPortal(children, dest) : null
}

export function InputCardField({ label, value, min, max, step, onChange, unit = "" }) {
  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl w-full" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(196,149,106,0.1)' }}>
      <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-wider text-[rgba(220,208,188,0.45)]">
        <span>{label}</span>
        {unit && <span className="font-bold text-[#C4956A]">{unit}</span>}
      </div>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[rgba(0,0,0,0.25)] border border-[rgba(220,200,165,0.15)] rounded-lg text-[#E8DDCC] px-3.5 py-2 text-sm font-mono focus:border-[#C4956A] outline-none transition-all"
      />
      <div className="flex justify-between text-[9px] font-mono text-[rgba(220,200,165,0.25)]">
        <span>Min: {min}</span>
        <span>Max: {max}</span>
      </div>
    </div>
  )
}

export function getInitialParam(initialParams, paramName, defaultVal) {
  if (initialParams) {
    if (initialParams.params && initialParams.params[paramName] !== undefined) {
      return initialParams.params[paramName];
    }
    return "";
  }
  return defaultVal;
}
