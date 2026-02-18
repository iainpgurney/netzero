'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const STORAGE_KEY_SHOW = 'time-off-show-leave-year'
const STORAGE_KEY_VIEW_NEXT = 'time-off-view-next-year'

type LeaveYearContextType = {
  showLeaveYear: boolean
  setShowLeaveYear: (value: boolean) => void
  viewNextYear: boolean
  setViewNextYear: (value: boolean) => void
}

const LeaveYearContext = createContext<LeaveYearContextType | null>(null)

export function LeaveYearProvider({ children }: { children: React.ReactNode }) {
  const [showLeaveYear, setShowLeaveYearState] = useState(true)
  const [viewNextYear, setViewNextYearState] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedShow = localStorage.getItem(STORAGE_KEY_SHOW)
      if (storedShow !== null) setShowLeaveYearState(storedShow === 'true')
      const storedView = localStorage.getItem(STORAGE_KEY_VIEW_NEXT)
      if (storedView !== null) setViewNextYearState(storedView === 'true')
    }
  }, [])

  const setShowLeaveYear = useCallback((value: boolean) => {
    setShowLeaveYearState(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SHOW, String(value))
    }
  }, [])

  const setViewNextYear = useCallback((value: boolean) => {
    setViewNextYearState(value)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_VIEW_NEXT, String(value))
    }
  }, [])

  return (
    <LeaveYearContext.Provider value={{ showLeaveYear, setShowLeaveYear, viewNextYear, setViewNextYear }}>
      {children}
    </LeaveYearContext.Provider>
  )
}

export function useShowLeaveYear() {
  const ctx = useContext(LeaveYearContext)
  if (!ctx) {
    return {
      showLeaveYear: true,
      setShowLeaveYear: () => {},
      viewNextYear: false,
      setViewNextYear: () => {},
    }
  }
  return ctx
}
