import { checkRealism as checkRealismFn } from '../lib/parameterExtractor'

export function checkRealism(equationId, params) {
  return checkRealismFn(equationId, params)
}

export function RealismCheckCard({ realism, equationId, params, isPending }) {
  const r = realism || (equationId && params ? checkRealism(equationId, params) : null)
  if (!r) return null
  if (isPending) return null
  if (r.isRealistic) return null

  return (
    <div className="p-3.5 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.04)] text-red-400 font-mono text-xs mb-3">
      <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Unrealistic Parameters</span>
      {r.reason && <p className="opacity-80">{r.reason}</p>}
      {r.correctiveSuggestion && (
        <p className="text-[rgba(196,149,106,0.7)] mt-1">{r.correctiveSuggestion}</p>
      )}
    </div>
  )
}
