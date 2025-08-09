import React from 'react'
import { useProfiles } from '../hooks/useSupabase'
import { Search } from 'lucide-react'

const Team: React.FC = () => {
  const { profiles, loading } = useProfiles()
  const [query, setQuery] = React.useState('')

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return profiles
    return profiles.filter(p => p.name.toLowerCase().includes(q))
  }, [profiles, query])

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200 bg-white w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Team</h1>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(p => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
                <img src={p.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.name)}`} alt={p.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{p.role}</p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-gray-500">No members found</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Team


