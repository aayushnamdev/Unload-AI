'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ItemActionsProps {
  itemId: string
  onDone?: (itemId: string) => void
  onPark?: (itemId: string, parkedUntil: string) => void
  onDrop?: (itemId: string) => void
  disabled?: boolean
}

export function ItemActions({
  itemId,
  onDone,
  onPark,
  onDrop,
  disabled = false,
}: ItemActionsProps) {
  const [showParkOptions, setShowParkOptions] = useState(false)
  const [showDropConfirm, setShowDropConfirm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDone = async () => {
    if (onDone) {
      setIsProcessing(true)
      await onDone(itemId)
      setIsProcessing(false)
    }
  }

  const handlePark = async (days: number) => {
    if (onPark) {
      const date = new Date()
      date.setDate(date.getDate() + days)
      setIsProcessing(true)
      await onPark(itemId, date.toISOString())
      setIsProcessing(false)
      setShowParkOptions(false)
    }
  }

  const handleDrop = async () => {
    if (onDrop) {
      setIsProcessing(true)
      await onDrop(itemId)
      setIsProcessing(false)
      setShowDropConfirm(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Primary actions */}
      <div className="flex gap-3">
        {/* Done button - most prominent */}
        <button
          onClick={handleDone}
          disabled={disabled || isProcessing}
          className={cn(
            'flex-1 group relative overflow-hidden',
            'py-3 px-6 rounded-xl font-semibold',
            'bg-gradient-to-r from-green-500 to-emerald-500',
            'text-white shadow-lg shadow-green-500/30',
            'transition-all duration-300 ease-out',
            'hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02]',
            'active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
          )}
        >
          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <span className="relative flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Done
          </span>
        </button>

        {/* Park button */}
        <button
          onClick={() => setShowParkOptions(!showParkOptions)}
          disabled={disabled || isProcessing}
          className={cn(
            'flex-1 group relative overflow-hidden',
            'py-3 px-6 rounded-xl font-semibold',
            'bg-gradient-to-r from-blue-500 to-cyan-500',
            'text-white shadow-lg shadow-blue-500/30',
            'transition-all duration-300 ease-out',
            'hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02]',
            'active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
          )}
        >
          <span className="relative flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Park
          </span>
        </button>

        {/* Drop button */}
        <button
          onClick={() => setShowDropConfirm(!showDropConfirm)}
          disabled={disabled || isProcessing}
          className={cn(
            'flex-1 group relative overflow-hidden',
            'py-3 px-6 rounded-xl font-semibold',
            'bg-gradient-to-r from-gray-400 to-gray-500',
            'text-white shadow-lg shadow-gray-500/30',
            'transition-all duration-300 ease-out',
            'hover:from-red-500 hover:to-pink-500',
            'hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02]',
            'active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
          )}
        >
          <span className="relative flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Drop
          </span>
        </button>
      </div>

      {/* Park options */}
      {showParkOptions && (
        <div className="animate-slide-down bg-white/20 backdrop-blur-xl rounded-xl p-4 border border-white/30">
          <p className="text-sm text-gray-700 font-medium mb-3">Park until:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Tomorrow', days: 1 },
              { label: 'This Weekend', days: 5 },
              { label: 'Next Week', days: 7 },
              { label: 'Next Month', days: 30 },
            ].map((option) => (
              <button
                key={option.days}
                onClick={() => handlePark(option.days)}
                disabled={isProcessing}
                className="py-2 px-4 rounded-lg bg-blue-100/60 hover:bg-blue-200/60 text-blue-700 font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Drop confirmation */}
      {showDropConfirm && (
        <div className="animate-slide-down bg-white/20 backdrop-blur-xl rounded-xl p-4 border border-red-200/50">
          <p className="text-sm text-gray-700 font-medium mb-3">
            Let this go? It won&apos;t bother you anymore.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDrop}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              Yes, drop it
            </button>
            <button
              onClick={() => setShowDropConfirm(false)}
              disabled={isProcessing}
              className="flex-1 py-2 px-4 rounded-lg bg-gray-200/60 hover:bg-gray-300/60 text-gray-700 font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Nevermind
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
