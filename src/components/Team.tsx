import React from 'react'
import { useProfiles } from '../hooks/useSupabase'
import ConsistentHeader from './ConsistentHeader'

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
      <ConsistentHeader
        title="Equipo"
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="Buscar por nombre..."
        showCreateButton={false}
      />

             <div className="flex-1 overflow-auto p-6">
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


