import React from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Plus,
  SortAsc,
  LayoutGrid,
  List,
  X,
  Flag,
  Clock,
  Type,
  ListChecks
} from 'lucide-react';
import { Project, TaskFilter, TaskPriority, TaskStatus, SupabaseProfile } from '../types';

const DateWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative">
    <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
    {children}
  </div>
)

type Option = { value: string; label: string }

// (Dropdown simple removido al migrar a MultiSelect)

const Avatar: React.FC<{ name: string; src?: string | null; size?: number }> = ({ name, src, size = 20 }) => {
  const initials = name.split(' ').slice(0,2).map(n => n[0]?.toUpperCase()).join('') || 'U'
  const bg = 'bg-blue-100 text-blue-700'
  return src ? (
    <img src={src} alt={name} className="inline-block rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span className={`inline-flex items-center justify-center rounded-full ${bg}`} style={{ width: size, height: size, fontSize: 11 }}>{initials}</span>
  )
}

const SingleSelectDropdown: React.FC<{
  value?: string
  onChange: (val: string) => void
  options: Array<Option & { icon?: React.ReactNode }>
  placeholder?: string
  className?: string
}> = ({ value, onChange, options, placeholder = 'Select', className = '' }) => {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])
  const selected = options.find(o => o.value === value)
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full inline-flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate inline-flex items-center gap-2">
          {selected?.icon}
          {selected?.label || placeholder}
        </span>
        <svg className="ml-2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden origin-top-left transform transition-all duration-150 ease-out scale-100 opacity-100">
          <ul className="max-h-60 overflow-auto py-1">
            {options.map(o => (
              <li key={o.value}>
                <button
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${value === o.value ? 'bg-blue-50 text-blue-700' : 'text-gray-800 hover:bg-gray-50'}`}
                  onClick={() => { onChange(o.value); setOpen(false) }}
                >
                  {o.icon}
                  <span className="truncate">{o.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

const MultiSelectDropdown: React.FC<{
  values: string[]
  onChange: (vals: string[]) => void
  options: Array<Option & { avatar?: string | null }>
  placeholder?: string
  className?: string
}> = ({ values, onChange, options, placeholder = 'Select', className = '' }) => {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [q, setQ] = React.useState('')
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])
  const selectedLabels = options.filter(o => values.includes(o.value)).map(o => o.label)
  const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()))
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full inline-flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate">
          {selectedLabels.length ? selectedLabels.join(', ') : placeholder}
        </span>
        <svg className="ml-2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden origin-top-left transform transition-all duration-150 ease-out scale-100 opacity-100">
          <div className="p-2 border-b">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search member..." className="w-full border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <ul className="max-h-60 overflow-auto py-1">
            <li className="px-3 py-2 text-xs text-gray-500">Select assignees</li>
            {filtered.map(o => {
              const active = values.includes(o.value)
              return (
                <li key={o.value}>
                  <button
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-800 hover:bg-gray-50'}`}
                    onClick={() => {
                      const next = active ? values.filter(v => v !== o.value) : [...values, o.value]
                      onChange(next)
                    }}
                  >
                    <Avatar name={o.label} src={(o as any).avatar} />
                    <span className="truncate">{o.label}</span>
                    <span className="ml-auto">{active ? '✓' : ''}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="flex items-center justify-between px-3 py-2 border-t bg-gray-50">
            <button onClick={() => onChange([])} className="text-sm text-gray-600 hover:text-gray-900">Clear</button>
            <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">Done</button>
          </div>
        </div>
      )}
    </div>
  )
}

interface HeaderProps {
  selectedProject: Project | null;
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  onCreateTask: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  taskView?: 'board' | 'list';
  onTaskViewChange?: (view: 'board' | 'list') => void;
  assignees?: SupabaseProfile[];
}

const Header: React.FC<HeaderProps> = ({
  selectedProject,
  filter,
  onFilterChange,
  onCreateTask,
  searchQuery,
  onSearchChange,
  taskView = 'board',
  onTaskViewChange,
  assignees = [],
}) => {
  const [activePanel, setActivePanel] = React.useState<null | 'filter' | 'sort' | 'assignee' | 'due'>(null)
  //

  const toggleValueInArray = <T,>(arr: T[] | undefined, val: T): T[] => {
    const base = arr || []
    return base.includes(val) ? base.filter(v => v !== val) : [...base, val]
  }

  const statusOptions: TaskStatus[] = ['todo','in-progress','review','done']
  const priorityOptions: TaskPriority[] = ['low','normal','high','urgent']

  const statusClass = (s: TaskStatus, active: boolean) => {
    const base = 'px-2.5 py-1 rounded-full text-xs border'
    const map: Record<TaskStatus, string> = {
      'todo': active ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-700',
      'in-progress': active ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-700',
      'review': active ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-700',
      'done': active ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-700',
    }
    return `${base} ${map[s]}`
  }

  const priorityClass = (p: TaskPriority, active: boolean) => {
    const base = 'px-2.5 py-1 rounded-full text-xs border'
    const map: Record<TaskPriority, string> = {
      'low': active ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-gray-50 border-gray-200 text-gray-700',
      'normal': active ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-gray-50 border-gray-200 text-gray-700',
      'high': active ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-gray-50 border-gray-200 text-gray-700',
      'urgent': active ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-700',
    }
    return `${base} ${map[p]}`
  }

  const handleToggleStatus = (s: TaskStatus) => {
    onFilterChange({ ...filter, status: toggleValueInArray(filter.status, s) })
  }
  const handleTogglePriority = (p: TaskPriority) => {
    onFilterChange({ ...filter, priority: toggleValueInArray(filter.priority, p) })
  }
  const handleToggleOverdue = () => {
    onFilterChange({ ...filter, overdue: !filter.overdue })
  }
  const handleAssigneesChange = (ids: string[]) => {
    onFilterChange({ ...filter, assignee: ids })
  }
  const togglePanel = (panel: 'filter' | 'sort' | 'assignee' | 'due') => {
    setActivePanel(prev => (prev === panel ? null : panel))
  }

  const resetFilterPanel = () => {
    onFilterChange({ ...filter, status: undefined, priority: undefined })
  }
  const resetSortPanel = () => {
    onFilterChange({ ...filter, sortBy: undefined, sortDir: undefined })
  }
  const resetAssigneePanel = () => {
    onFilterChange({ ...filter, assignee: [] })
  }
  const resetDuePanel = () => {
    onFilterChange({ ...filter, dueFrom: undefined, dueTo: undefined, overdue: undefined })
  }
  const isActive = (arr: string[] | undefined, v: string) => !!arr?.includes(v)
  const getAssigneeName = (id: string) => assignees.find(a => a.id === id)?.name || 'Assignee'
  const hasAnyFilters = !!(
    (filter.status && filter.status.length) ||
    (filter.priority && filter.priority.length) ||
    (filter.assignee && filter.assignee.length) ||
    filter.dueFrom || filter.dueTo || filter.overdue || filter.sortBy || filter.sortDir
  )
  const clearAllFilters = () => { onFilterChange({}) }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Project Title */}
          <div className="flex items-center space-x-3">
            {selectedProject && (
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedProject.color }}
              />
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedProject ? selectedProject.name : 'All Tasks'}
            </h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => onTaskViewChange && onTaskViewChange('board')}
              className={`flex items-center gap-1 px-3 py-2 text-sm ${taskView === 'board' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              title="Board view"
            >
              <LayoutGrid className="w-4 h-4" />
              Board
            </button>
            <button
              onClick={() => onTaskViewChange && onTaskViewChange('list')}
              className={`flex items-center gap-1 px-3 py-2 text-sm border-l border-gray-200 ${taskView === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>

          {/* Filter Controls */}
          <button onClick={() => togglePanel('filter')} className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${activePanel==='filter' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter</span>
          </button>

          <button onClick={() => togglePanel('sort')} className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${activePanel==='sort' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
            <SortAsc className="w-4 h-4" />
            <span className="text-sm font-medium">Sort</span>
          </button>

          <button onClick={() => togglePanel('assignee')} className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${activePanel==='assignee' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Assignee</span>
          </button>

          <button onClick={() => togglePanel('due')} className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${activePanel==='due' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Due Date</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            {/* Notifications */}
            {/* New Task Button */}
            <button
              onClick={onCreateTask}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">New Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Always-visible chips row when there are filters applied */}
      {hasAnyFilters && (
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {filter.status?.map(s => (
              <button key={`s-${s}`} onClick={() => onFilterChange({ ...filter, status: (filter.status||[]).filter(x => x !== s) })} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
                {s.replace('-', ' ')}
                <X className="w-3 h-3" />
              </button>
            ))}
            {filter.priority?.map(p => (
              <button key={`p-${p}`} onClick={() => onFilterChange({ ...filter, priority: (filter.priority||[]).filter(x => x !== p) })} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-purple-50 text-purple-700">
                {p}
                <X className="w-3 h-3" />
              </button>
            ))}
            {filter.assignee?.map(a => (
              <button key={`a-${a}`} onClick={() => onFilterChange({ ...filter, assignee: (filter.assignee||[]).filter(x => x !== a) })} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                {getAssigneeName(a)}
                <X className="w-3 h-3" />
              </button>
            ))}
            {(filter.dueFrom || filter.dueTo) && (
              <button onClick={() => onFilterChange({ ...filter, dueFrom: undefined, dueTo: undefined })} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-amber-50 text-amber-700">
                {filter.dueFrom || '...'} → {filter.dueTo || '...'}
                <X className="w-3 h-3" />
              </button>
            )}
            {filter.overdue && (
              <button onClick={() => onFilterChange({ ...filter, overdue: undefined })} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-red-50 text-red-700">
                Overdue
                <X className="w-3 h-3" />
              </button>
            )}
            {(filter.sortBy || filter.sortDir) && (
              <button onClick={() => onFilterChange({ ...filter, sortBy: undefined, sortDir: undefined })} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-gray-50 text-gray-700 border border-gray-200">
                Sort
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <button onClick={clearAllFilters} className="text-sm text-gray-600 hover:text-gray-900">Clear all</button>
        </div>
      )}

      {activePanel && (
        <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-4 w-full">
              {/* Active chips removed inside panel to avoid duplication */}
              {activePanel === 'filter' && (
                <>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2">Status</div>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map(s => (
                        <button
                          key={s}
                          onClick={() => handleToggleStatus(s)}
                          className={statusClass(s, isActive(filter.status as any, s))}
                        >
                          {s.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2">Priority</div>
                    <div className="flex flex-wrap gap-2">
                      {priorityOptions.map(p => (
                        <button
                          key={p}
                          onClick={() => handleTogglePriority(p)}
                          className={priorityClass(p, isActive(filter.priority as any, p))}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={resetFilterPanel} className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Reset</button>
                    <button onClick={() => setActivePanel(null)} className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">Apply</button>
                  </div>
                </>
              )}

              {activePanel === 'assignee' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Assignee</label>
                    <MultiSelectDropdown
                      values={filter.assignee || []}
                      onChange={handleAssigneesChange}
                      options={assignees.map(a => ({ value: a.id, label: a.name, avatar: (a as any).avatar }))}
                      placeholder="Any"
                    />
                  </div>
                  <div className="sm:col-start-3 flex justify-end gap-2">
                    <button onClick={resetAssigneePanel} className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Reset</button>
                    <button onClick={() => setActivePanel(null)} className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">Apply</button>
                  </div>
                </div>
              )}

              {activePanel === 'due' && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Due from</label>
                    <DateWrapper>
                      <input
                        type="date"
                        className="appearance-none w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filter.dueFrom || ''}
                        onChange={(e) => onFilterChange({ ...filter, dueFrom: e.target.value || undefined })}
                      />
                    </DateWrapper>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Due to</label>
                    <DateWrapper>
                      <input
                        type="date"
                        className="appearance-none w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={filter.dueTo || ''}
                        onChange={(e) => onFilterChange({ ...filter, dueTo: e.target.value || undefined })}
                      />
                    </DateWrapper>
                  </div>
                  <div className="flex items-center justify-center gap-2 self-center">
                    <input id="overdue" type="checkbox" checked={!!filter.overdue} onChange={handleToggleOverdue} className="rounded border-gray-300" />
                    <label htmlFor="overdue" className="text-sm text-gray-700">Overdue only</label>
                  </div>
                  <div className="sm:col-start-4 flex justify-end gap-2">
                    <button onClick={resetDuePanel} className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Reset</button>
                    <button onClick={() => setActivePanel(null)} className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">Apply</button>
                  </div>
                </div>
              )}

              {activePanel === 'sort' && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Sort by</label>
                    <SingleSelectDropdown
                      value={filter.sortBy}
                      onChange={(val) => onFilterChange({ ...filter, sortBy: (val || undefined) as any })}
                      options={[
                        { value: '', label: 'Default', icon: <ListChecks className="w-4 h-4 text-gray-400"/> },
                        { value: 'dueDate', label: 'Due date', icon: <Clock className="w-4 h-4 text-gray-400"/> },
                        { value: 'priority', label: 'Priority', icon: <Flag className="w-4 h-4 text-gray-400"/> },
                        { value: 'status', label: 'Status', icon: <List className="w-4 h-4 text-gray-400"/> },
                        { value: 'createdAt', label: 'Created', icon: <Clock className="w-4 h-4 text-gray-400"/> },
                        { value: 'title', label: 'Title', icon: <Type className="w-4 h-4 text-gray-400"/> },
                      ]}
                      placeholder="Default"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Direction</label>
                    <div className="inline-flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-md text-xs ${(!filter.sortDir || filter.sortDir==='asc') ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}>ABC</span>
                      <button
                        type="button"
                        onClick={() => onFilterChange({ ...filter, sortDir: (filter.sortDir === 'desc' ? 'asc' : 'desc') })}
                        className="relative inline-flex h-7 w-12 items-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300"
                        aria-label="Toggle direction"
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${filter.sortDir === 'desc' ? 'translate-x-6' : 'translate-x-1'}`}></span>
                      </button>
                      <span className={`px-2 py-1 rounded-md text-xs ${(filter.sortDir==='desc') ? 'bg-blue-50 text-blue-700' : 'text-gray-600'}`}>ZYX</span>
                    </div>
                  </div>
                  <div className="sm:col-start-4 flex justify-end gap-2">
                    <button onClick={resetSortPanel} className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Reset</button>
                    <button onClick={() => setActivePanel(null)} className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">Apply</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setActivePanel(null)} className="ml-4 p-2 text-gray-500 hover:text-gray-700"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;