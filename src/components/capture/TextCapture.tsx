'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { MAX_THOUGHT_DUMP_LENGTH } from '@/lib/constants'

interface TextCaptureProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  disabled?: boolean
  placeholder?: string
}

const warmPlaceholders = [
  "Let it all out...",
  "What's weighing on you?",
  "Your thoughts are safe here...",
  "Take a breath. What's on your mind?",
  "No judgment, just release...",
  "What do you need to let go of today?",
]

export function TextCapture({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder,
}: TextCaptureProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [currentPlaceholder, setCurrentPlaceholder] = useState(
    placeholder || warmPlaceholders[0]
  )

  // Auto-resize textarea as content changes
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto'
    // Set height to scrollHeight to fit content
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [value])

  // Rotate placeholder on mount
  useEffect(() => {
    if (!placeholder) {
      const randomIndex = Math.floor(Math.random() * warmPlaceholders.length)
      setCurrentPlaceholder(warmPlaceholders[randomIndex])
    }
  }, [placeholder])

  const characterCount = value.length
  const isNearLimit = characterCount > MAX_THOUGHT_DUMP_LENGTH * 0.9
  const isOverLimit = characterCount > MAX_THOUGHT_DUMP_LENGTH

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && onSubmit) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="relative w-full">
      {/* Breathing ambient background when empty */}
      {!value && !isFocused && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-breath"
          />
        </div>
      )}

      {/* Main textarea container */}
      <div
        className={cn(
          'relative transition-all duration-500 ease-out',
          isFocused && 'scale-[1.01]'
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={currentPlaceholder}
          className={cn(
            // Base styles
            'w-full min-h-[320px] max-h-[600px] p-8 sm:p-10 rounded-2xl',
            'text-base sm:text-lg leading-relaxed text-gray-800 font-light',
            'placeholder:text-gray-400 placeholder:font-light',
            'resize-none overflow-y-auto',
            'transition-all duration-700 ease-out',

            // Subtle background
            'bg-white/20 backdrop-blur-sm',
            'border border-gray-200/50',
            'shadow-inner',

            // Focus state - calm and gentle
            'focus:outline-none focus:bg-white/30',
            'focus:border-gray-300/50 focus:shadow-lg',
            'focus:ring-2 focus:ring-gray-200/30',

            // Disabled state
            'disabled:opacity-50 disabled:cursor-not-allowed',

            // Scrollbar styling
            'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent',

            // Error state
            isOverLimit && 'border-red-300/50 focus:border-red-300/70 focus:ring-red-200/20'
          )}
          style={{
            // Custom scrollbar for webkit browsers
            WebkitOverflowScrolling: 'touch',
          }}
        />

        {/* Character counter */}
        <div
          className={cn(
            'absolute bottom-3 right-4 text-xs font-medium transition-all duration-300',
            'bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full',
            'border border-white/40',
            isFocused ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
            isNearLimit && !isOverLimit && 'text-orange-600 bg-orange-50/80 border-orange-200',
            isOverLimit && 'text-red-600 bg-red-50/80 border-red-200 animate-pulse'
          )}
        >
          {characterCount.toLocaleString()} / {MAX_THOUGHT_DUMP_LENGTH.toLocaleString()}
        </div>
      </div>

      {/* Hint text */}
      <div
        className={cn(
          'mt-3 text-sm text-gray-500 text-center transition-all duration-300',
          isFocused ? 'opacity-100' : 'opacity-0'
        )}
      >
        <span className="inline-flex items-center gap-2">
          <kbd className="px-2 py-0.5 text-xs bg-white/40 backdrop-blur-sm rounded border border-white/50 font-mono">
            {typeof window !== 'undefined' && navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl'}
          </kbd>
          <span>+</span>
          <kbd className="px-2 py-0.5 text-xs bg-white/40 backdrop-blur-sm rounded border border-white/50 font-mono">
            Enter
          </kbd>
          <span className="ml-1">to submit</span>
        </span>
      </div>

      <style jsx>{`
        @keyframes breath {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.2);
          }
        }

        .animate-breath {
          animation: breath 4s ease-in-out infinite;
        }

        /* Custom scrollbar for webkit */
        textarea::-webkit-scrollbar {
          width: 8px;
        }

        textarea::-webkit-scrollbar-track {
          background: transparent;
        }

        textarea::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 4px;
        }

        textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </div>
  )
}
