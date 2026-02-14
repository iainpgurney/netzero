'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { type RAGStatus } from './DepartmentCard'

interface UpdateStatusModalProps {
  isOpen: boolean
  onClose: () => void
  department: {
    name: string
    currentStatus: RAGStatus
    currentReason: string
    priority?: 'P1' | 'P2' | 'P3' | null
  }
  onSubmit: (status: RAGStatus, reason: string, priority: 'P1' | 'P2' | 'P3' | null) => void
}

const statusOptions = [
  {
    value: 'green',
    label: 'Healthy',
    description: 'Performing well, on track',
    emoji: '🟢',
    radioClass: 'border-green-500 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500',
  },
  {
    value: 'amber',
    label: 'Caution',
    description: 'Some concerns, monitoring needed',
    emoji: '🟠',
    radioClass: 'border-amber-500 data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-500',
  },
  {
    value: 'red',
    label: 'Critical',
    description: 'Requires immediate attention',
    emoji: '🔴',
    radioClass: 'border-red-500 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500',
  },
]

export function UpdateStatusModal({
  isOpen,
  onClose,
  department,
  onSubmit,
}: UpdateStatusModalProps) {
  const [status, setStatus] = useState<RAGStatus>(department.currentStatus)
  const [reason, setReason] = useState(department.currentReason)
  const [priority, setPriority] = useState<'P1' | 'P2' | 'P3' | null>(department.priority || null)
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for this status')
      return
    }
    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters')
      return
    }

    onSubmit(status, reason.trim(), priority)
    setError('')
  }

  const handleReasonChange = (value: string) => {
    setReason(value)
    if (error) setError('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl sm:text-2xl">
            Update Status: {department.name}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Set the current health status and provide context for the team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Status Selection */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-medium">Status</Label>
            <RadioGroup
              value={status}
              onValueChange={(value) => setStatus(value as RAGStatus)}
              className="space-y-3"
            >
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <RadioGroupItem
                    value={option.value}
                    id={`rag-status-${option.value}`}
                    className={option.radioClass}
                  />
                  <label
                    htmlFor={`rag-status-${option.value}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{option.emoji}</span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Priority Selection */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-medium">Priority</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={priority === 'P1' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPriority(priority === 'P1' ? null : 'P1')}
                className={cn(
                  priority === 'P1' && 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                )}
              >
                P1
              </Button>
              <Button
                type="button"
                variant={priority === 'P2' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPriority(priority === 'P2' ? null : 'P2')}
                className={cn(
                  priority === 'P2' && 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600'
                )}
              >
                P2
              </Button>
              <Button
                type="button"
                variant={priority === 'P3' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPriority(priority === 'P3' ? null : 'P3')}
                className={cn(
                  priority === 'P3' && 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                )}
              >
                P3
              </Button>
              {priority && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPriority(null)}
                  className="text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Click to set priority (P1 = highest, P3 = lowest). Click again to clear.
            </p>
          </div>

          {/* Reason Text Area */}
          <div className="space-y-2">
            <Label htmlFor="rag-reason" className="text-sm sm:text-base font-medium">
              Reason
              <span className="text-muted-foreground text-xs sm:text-sm font-normal ml-2">
                (Required)
              </span>
            </Label>
            <Textarea
              id="rag-reason"
              placeholder="Explain why this department has this status. What's going well or what needs attention?"
              value={reason}
              onChange={(e) => handleReasonChange(e.target.value)}
              className={cn(
                'min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base',
                error && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
            <div className="flex justify-between items-center">
              <p
                className={cn(
                  'text-sm',
                  error ? 'text-red-600' : 'text-muted-foreground'
                )}
              >
                {error || `${reason.length} characters`}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className={cn(
              'w-full sm:w-auto min-w-[120px] order-1 sm:order-2',
              status === 'green' && 'bg-green-600 hover:bg-green-700 text-white',
              status === 'amber' && 'bg-amber-500 hover:bg-amber-600 text-white',
              status === 'red' && 'bg-red-500 hover:bg-red-600 text-white'
            )}
          >
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
