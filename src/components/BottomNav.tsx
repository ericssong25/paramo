import React from 'react'
import { Home, Calendar, CreditCard, Plus } from 'lucide-react'

interface BottomNavProps {
  activeView: string
  onViewChange: (view: string) => void
  onCreateTask: () => void
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onViewChange, onCreateTask }) => {
  const Item: React.FC<{ id: string; label: string; icon: React.ReactNode }>
    = ({ id, label, icon }) => (
    <button
      onClick={() => onViewChange(id)}
      className={`flex flex-col items-center justify-center flex-1 py-2 text-xs ${
        activeView === id ? 'text-blue-600' : 'text-gray-600'
      }`}
    >
      <span className="mb-1">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  )

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 z-40">
      <div className="relative max-w-4xl mx-auto">
        {/* Action Button */}
        <button
          onClick={onCreateTask}
          className="absolute -top-6 right-4 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center"
          aria-label="Crear tarea"
        >
          <Plus className="w-6 h-6" />
        </button>
        <nav className="flex items-center justify-between px-2 py-1">
          <Item id="tasks" label="Tareas" icon={<Home className="w-5 h-5" />} />
          <Item id="content" label="Contenido" icon={<Calendar className="w-5 h-5" />} />
          <Item id="subscriptions" label="Subs" icon={<CreditCard className="w-5 h-5" />} />
        </nav>
      </div>
    </div>
  )
}

export default BottomNav
