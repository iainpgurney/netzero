'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { HelpCircle, X } from 'lucide-react'

const HELPER_OPTIONS = [
  { label: 'I need to complete a task', href: '/intranet/boards' },
  { label: 'I need to understand my energy and team dynamics', href: '/intranet/impact-alignment' },
  { label: 'I need to understand roles and responsibilities', href: '/intranet/company#raci' },
  { label: 'I need to understand the company', href: '/intranet/company' },
  { label: 'I need a document or policy', href: '/intranet/resources' },
]

export default function HelperButton() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="absolute bottom-14 right-0 w-64 rounded-lg border border-gray-200 bg-white shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm text-gray-900">Not Sure Where To Start?</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            {HELPER_OPTIONS.map((opt) => (
              <Link
                key={opt.label}
                href={opt.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800 rounded-md transition-colors"
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      )}
      <Button
        onClick={() => setOpen(!open)}
        variant="outline"
        size="sm"
        className="rounded-full shadow-md bg-white hover:bg-green-50 border-green-200"
      >
        <HelpCircle className="w-4 h-4 mr-1.5" />
        Not Sure Where To Start?
      </Button>
    </div>
  )
}
