'use client'

import { Fragment, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { trpc } from '@/lib/trpc'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ClipboardList,
  Loader2,
  Users,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Search,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
} from 'lucide-react'

const DOMAIN_LABELS: Record<string, string> = {
  GOVERNANCE: 'Governance',
  SALES: 'Sales',
  PRODUCT_PLATFORM: 'Product / Platform',
  DELIVERY_MRV: 'Delivery / MRV',
  PEOPLE: 'People',
  FINANCE: 'Finance',
}

const DOMAIN_VALUES = Object.keys(DOMAIN_LABELS)

const ROLE_BADGE: Record<string, { bg: string; text: string }> = {
  A: { bg: 'bg-red-100', text: 'text-red-700' },
  R: { bg: 'bg-blue-100', text: 'text-blue-700' },
  C: { bg: 'bg-amber-100', text: 'text-amber-700' },
  I: { bg: 'bg-gray-100', text: 'text-gray-500' },
}

type Tab = 'outcomes' | 'people' | 'gaps'

function Badge({ role, name, isJoint, isTemp, onRemove }: { role: string; name: string; isJoint?: boolean; isTemp?: boolean; onRemove?: () => void }) {
  const b = ROLE_BADGE[role]
  if (!b) return null
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${b.bg} ${b.text}`}>
      {name}
      {isJoint && <span className="text-[9px] opacity-70">(Joint)</span>}
      {isTemp && <span className="text-[9px] opacity-70">(Temp)</span>}
      {onRemove && (
        <button onClick={(e) => { e.stopPropagation(); onRemove() }} className="ml-0.5 hover:opacity-70">
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}

function OutcomesTab() {
  const utils = trpc.useUtils()
  const { data: version, isLoading } = trpc.raci.getLatestVersion.useQuery()
  const [activeDomain, setActiveDomain] = useState<string | null>(null)
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set(DOMAIN_VALUES))
  const [personFilter, setPersonFilter] = useState('')
  const [editingKpi, setEditingKpi] = useState<string | null>(null)
  const [kpiValue, setKpiValue] = useState('')
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newPerson, setNewPerson] = useState('')
  const [newRole, setNewRole] = useState<'R' | 'A' | 'C' | 'I'>('R')

  const updateKpi = trpc.raci.updateKpi.useMutation({ onSuccess: () => { utils.raci.getLatestVersion.invalidate(); setEditingKpi(null) } })
  const removeAssignment = trpc.raci.removeAssignment.useMutation({ onSuccess: () => utils.raci.getLatestVersion.invalidate() })
  const addAssignment = trpc.raci.updateAssignment.useMutation({ onSuccess: () => { utils.raci.getLatestVersion.invalidate(); setAddingTo(null); setNewPerson('') } })
  const deleteOutcome = trpc.raci.deleteOutcome.useMutation({ onSuccess: () => utils.raci.getLatestVersion.invalidate() })

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
  if (!version) return <p className="text-sm text-gray-500">No RACI data.</p>

  const toggleDomain = (d: string) => {
    const next = new Set(expandedDomains)
    next.has(d) ? next.delete(d) : next.add(d)
    setExpandedDomains(next)
  }

  let outcomes = version.outcomes
  if (activeDomain) outcomes = outcomes.filter(o => o.domain === activeDomain)
  if (personFilter.trim()) {
    const q = personFilter.toLowerCase()
    outcomes = outcomes.filter(o => o.assignments.some(a => a.personName.toLowerCase().includes(q)))
  }

  const grouped = outcomes.reduce<Record<string, typeof outcomes>>((acc, o) => {
    (acc[o.domain] ??= []).push(o)
    return acc
  }, {})

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => setActiveDomain(null)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${!activeDomain ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
        {Object.entries(DOMAIN_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => setActiveDomain(activeDomain === key ? null : key)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${activeDomain === key ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{label}</button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={personFilter} onChange={(e) => setPersonFilter(e.target.value)} placeholder="Filter by person..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 px-2 text-gray-500 font-semibold w-1/5">Outcome</th>
              <th className="text-left py-2 px-2 text-gray-500 font-semibold"><span className={`inline-block w-5 h-5 rounded text-center text-xs font-bold leading-5 ${ROLE_BADGE.R.bg} ${ROLE_BADGE.R.text}`}>R</span></th>
              <th className="text-left py-2 px-2 text-gray-500 font-semibold"><span className={`inline-block w-5 h-5 rounded text-center text-xs font-bold leading-5 ${ROLE_BADGE.A.bg} ${ROLE_BADGE.A.text}`}>A</span></th>
              <th className="text-left py-2 px-2 text-gray-500 font-semibold"><span className={`inline-block w-5 h-5 rounded text-center text-xs font-bold leading-5 ${ROLE_BADGE.C.bg} ${ROLE_BADGE.C.text}`}>C</span></th>
              <th className="text-left py-2 px-2 text-gray-500 font-semibold"><span className={`inline-block w-5 h-5 rounded text-center text-xs font-bold leading-5 ${ROLE_BADGE.I.bg} ${ROLE_BADGE.I.text}`}>I</span></th>
              <th className="text-left py-2 px-2 text-gray-500 font-semibold">KPI</th>
              <th className="py-2 px-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(DOMAIN_LABELS).map(([domainKey, domainLabel]) => {
              const domainOutcomes = grouped[domainKey]
              if (!domainOutcomes?.length) return null
              const isExpanded = expandedDomains.has(domainKey)
              return (
                <Fragment key={domainKey}>
                  <tr className="cursor-pointer hover:bg-gray-50" onClick={() => toggleDomain(domainKey)}>
                    <td colSpan={7} className="py-2 px-2">
                      <div className="flex items-center gap-2 font-semibold text-gray-800">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        {domainLabel} <span className="text-xs font-normal text-gray-400">({domainOutcomes.length})</span>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && domainOutcomes.map((outcome) => {
                    const byRole = (role: string) => outcome.assignments.filter(a => a.role === role)
                    return (
                      <Fragment key={outcome.id}>
                        <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="py-2 px-2 text-gray-700 font-medium">{outcome.title}</td>
                          {(['R', 'A', 'C', 'I'] as const).map(role => (
                            <td key={role} className="py-2 px-2">
                              <div className="flex flex-wrap gap-1">
                                {byRole(role).map((a) => (
                                  <Badge key={a.id} role={role} name={a.personName} isJoint={a.isJointAccountable} isTemp={a.isTemporary}
                                    onRemove={() => removeAssignment.mutate({ assignmentId: a.id })} />
                                ))}
                              </div>
                            </td>
                          ))}
                          <td className="py-2 px-2">
                            {editingKpi === outcome.id ? (
                              <div className="flex items-center gap-1">
                                <input value={kpiValue} onChange={(e) => setKpiValue(e.target.value)} className="text-xs border rounded px-1 py-0.5 w-32" />
                                <button onClick={() => updateKpi.mutate({ outcomeId: outcome.id, kpi: kpiValue })}><Check className="w-3.5 h-3.5 text-green-600" /></button>
                                <button onClick={() => setEditingKpi(null)}><X className="w-3.5 h-3.5 text-gray-400" /></button>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => { setEditingKpi(outcome.id); setKpiValue(outcome.kpi) }}>
                                {outcome.kpi} <Pencil className="w-3 h-3 inline ml-1 opacity-40" />
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-1">
                              <button onClick={() => setAddingTo(addingTo === outcome.id ? null : outcome.id)} className="text-gray-400 hover:text-green-600"><Plus className="w-4 h-4" /></button>
                              <button onClick={() => { if (confirm('Delete this outcome?')) deleteOutcome.mutate({ outcomeId: outcome.id }) }} className="text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                        {addingTo === outcome.id && (
                          <tr className="bg-green-50/50">
                            <td colSpan={7} className="py-2 px-4">
                              <div className="flex items-center gap-2">
                                <input value={newPerson} onChange={(e) => setNewPerson(e.target.value)} placeholder="Person name" className="text-sm border rounded px-2 py-1 w-40" />
                                <select value={newRole} onChange={(e) => setNewRole(e.target.value as any)} className="text-sm border rounded px-2 py-1">
                                  <option value="R">R - Responsible</option>
                                  <option value="A">A - Accountable</option>
                                  <option value="C">C - Consulted</option>
                                  <option value="I">I - Informed</option>
                                </select>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs" disabled={!newPerson.trim()}
                                  onClick={() => addAssignment.mutate({ outcomeId: outcome.id, personName: newPerson.trim(), role: newRole })}>
                                  Add
                                </Button>
                                <button onClick={() => setAddingTo(null)}><X className="w-4 h-4 text-gray-400" /></button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PeopleTab() {
  const { data: load, isLoading } = trpc.raci.getPersonLoad.useQuery()

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
  if (!load?.length) return <p className="text-sm text-gray-500">No data.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-2 px-3 text-gray-500 font-semibold">Person</th>
            <th className="text-center py-2 px-3 text-gray-500 font-semibold"><span className={`inline-block w-5 h-5 rounded text-center text-xs font-bold leading-5 ${ROLE_BADGE.R.bg} ${ROLE_BADGE.R.text}`}>R</span></th>
            <th className="text-center py-2 px-3 text-gray-500 font-semibold"><span className={`inline-block w-5 h-5 rounded text-center text-xs font-bold leading-5 ${ROLE_BADGE.A.bg} ${ROLE_BADGE.A.text}`}>A</span></th>
            <th className="text-center py-2 px-3 text-gray-500 font-semibold"><span className={`inline-block w-5 h-5 rounded text-center text-xs font-bold leading-5 ${ROLE_BADGE.C.bg} ${ROLE_BADGE.C.text}`}>C</span></th>
            <th className="text-center py-2 px-3 text-gray-500 font-semibold"><span className={`inline-block w-5 h-5 rounded text-center text-xs font-bold leading-5 ${ROLE_BADGE.I.bg} ${ROLE_BADGE.I.text}`}>I</span></th>
            <th className="text-center py-2 px-3 text-gray-500 font-semibold">Total</th>
            <th className="text-left py-2 px-3 text-gray-500 font-semibold">Flags</th>
          </tr>
        </thead>
        <tbody>
          {load.map((p) => (
            <tr key={p.personName} className={`border-b border-gray-100 ${p.isOverloaded ? 'bg-red-50/50' : ''}`}>
              <td className="py-2 px-3 font-medium text-gray-800">{p.personName}</td>
              <td className="py-2 px-3 text-center">
                <span className={`inline-block min-w-[24px] px-1 py-0.5 rounded text-xs font-bold ${p.rCount > 0 ? ROLE_BADGE.R.bg + ' ' + ROLE_BADGE.R.text : 'text-gray-300'}`}>{p.rCount}</span>
              </td>
              <td className="py-2 px-3 text-center">
                <span className={`inline-block min-w-[24px] px-1 py-0.5 rounded text-xs font-bold ${p.aCount > 0 ? ROLE_BADGE.A.bg + ' ' + ROLE_BADGE.A.text : 'text-gray-300'}`}>{p.aCount}</span>
              </td>
              <td className="py-2 px-3 text-center">
                <span className={`inline-block min-w-[24px] px-1 py-0.5 rounded text-xs font-bold ${p.cCount > 0 ? ROLE_BADGE.C.bg + ' ' + ROLE_BADGE.C.text : 'text-gray-300'}`}>{p.cCount}</span>
              </td>
              <td className="py-2 px-3 text-center">
                <span className={`inline-block min-w-[24px] px-1 py-0.5 rounded text-xs font-bold ${p.iCount > 0 ? ROLE_BADGE.I.bg + ' ' + ROLE_BADGE.I.text : 'text-gray-300'}`}>{p.iCount}</span>
              </td>
              <td className="py-2 px-3 text-center text-xs text-gray-500">{p.aCount + p.rCount + p.cCount + p.iCount}</td>
              <td className="py-2 px-3">
                <div className="flex flex-wrap gap-1">
                  {p.isOverloaded && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">Overloaded</span>}
                  {p.isJointA.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">Joint A ({p.isJointA.length})</span>}
                  {p.isTemporaryA.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">Temp A ({p.isTemporaryA.length})</span>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function GapsTab() {
  const { data: issues, isLoading } = trpc.raci.getGapsConflicts.useQuery()

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
  if (!issues?.length) return (
    <div className="text-center py-12">
      <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
      <p className="text-sm text-gray-600 font-medium">No gaps or conflicts detected.</p>
    </div>
  )

  const typeLabels: Record<string, { label: string; color: string }> = {
    MISSING_A: { label: 'Missing Accountable', color: 'bg-red-100 text-red-700' },
    MULTIPLE_A: { label: 'Multiple Accountable', color: 'bg-red-100 text-red-700' },
    MISSING_R: { label: 'Missing Responsible', color: 'bg-amber-100 text-amber-700' },
    TEMPORARY_A: { label: 'Temporary Accountable', color: 'bg-purple-100 text-purple-700' },
    MISSING_KPI: { label: 'Missing KPI', color: 'bg-gray-100 text-gray-600' },
  }

  return (
    <div className="space-y-2">
      {issues.map((issue, i) => {
        const t = typeLabels[issue.type] || { label: issue.type, color: 'bg-gray-100 text-gray-600' }
        return (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
            <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${issue.type.includes('MISSING') ? 'text-amber-500' : 'text-purple-500'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{issue.outcomeTitle}</p>
              <p className="text-xs text-gray-500 mt-0.5">{issue.detail}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded font-medium whitespace-nowrap ${t.color}`}>{t.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function RaciAdminPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN'
  const [activeTab, setActiveTab] = useState<Tab>('outcomes')

  useEffect(() => {
    if (status === 'authenticated' && !isAdmin) {
      router.replace('/intranet')
    }
  }, [status, isAdmin, router])

  if (status === 'loading') return null
  if (!isAdmin) return null

  const tabs: { id: Tab; label: string; icon: typeof ClipboardList }[] = [
    { id: 'outcomes', label: 'Outcomes', icon: ClipboardList },
    { id: 'people', label: 'Person Load', icon: Users },
    { id: 'gaps', label: 'Gaps & Conflicts', icon: AlertTriangle },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RACI Matrix</h1>
            <p className="text-sm text-gray-500">Manage roles and responsibilities across Carma</p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <Card>
          <CardContent className="pt-6">
            {activeTab === 'outcomes' && <OutcomesTab />}
            {activeTab === 'people' && <PeopleTab />}
            {activeTab === 'gaps' && <GapsTab />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
