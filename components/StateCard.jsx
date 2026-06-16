import { useRouter } from 'next/router';

export default function StateCard({ state, isUT = false }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/state/${state.id}`)}
      className="card-hover bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100"
    >
      <div className={`bg-gradient-to-br ${state.color} h-28 flex flex-col items-center justify-center relative`}>
        <div className="text-5xl mb-1">{state.emoji}</div>
        {isUT && (
          <span className="absolute top-2 right-2 bg-white/80 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            UT
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">{state.name}</h3>
        <p className="text-xs text-gray-500 mb-3">🏙️ {state.capital}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-600">{state.schemes} Schemes</span>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            state.region === 'Northeast' ? 'bg-emerald-100 text-emerald-700' :
            state.region === 'South' ? 'bg-orange-100 text-orange-700' :
            state.region === 'North' ? 'bg-blue-100 text-blue-700' :
            state.region === 'East' ? 'bg-yellow-100 text-yellow-700' :
            state.region === 'West' ? 'bg-purple-100 text-purple-700' :
            state.region === 'Island' ? 'bg-cyan-100 text-cyan-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {state.region}
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-orange-600 font-semibold">View Schemes</span>
          <span className="text-orange-500">→</span>
        </div>
      </div>
    </div>
  );
}
