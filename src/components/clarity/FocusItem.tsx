'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { EFFORT_ESTIMATES } from '@/lib/constants'

interface FocusItemProps {
  id: string
  title: string
  type: 'task' | 'commitment' | 'deadline' | 'reminder'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  effort_level?: 'tiny' | 'small' | 'medium' | 'large'
  suggested_next_step?: string
  original_fragment?: string
  deadline_at?: string
  children?: React.ReactNode
  className?: string
}

const typeColors = {
  task: 'bg-blue-100/80 text-blue-700 border-blue-200/50',
  commitment: 'bg-teal-100/80 text-teal-700 border-teal-200/50',
  deadline: 'bg-orange-100/80 text-orange-700 border-orange-200/50',
  reminder: 'bg-purple-100/80 text-purple-700 border-purple-200/50',
}

const typeIcons = {
  task: '✓',
  commitment: '🤝',
  deadline: '⏰',
  reminder: '💡',
}

export function FocusItem({
  id,
  title,
  type,
  priority,
  effort_level,
  suggested_next_step,
  original_fragment,
  deadline_at,
  children,
  className,
}: FocusItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `In ${diffDays} days`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div
      className={cn(
        'group relative transition-all duration-500 ease-out',
        isHovering && 'scale-[1.02]',
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Glow effect on hover */}
      {isHovering && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 via-teal-400/20 to-green-400/20 rounded-2xl blur-xl transition-opacity duration-500" />
      )}

      {/* Main card */}
      <div
        className={cn(
          'relative bg-white/15 backdrop-blur-xl rounded-2xl p-6',
          'border border-white/30 shadow-xl',
          'transition-all duration-500',
          isHovering && 'bg-white/20 shadow-2xl border-white/40'
        )}
      >
        {/* Header with badges */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
              {typeIcons[type]}
            </span>
            <Badge
              variant="secondary"
              className={cn(
                'backdrop-blur-md border',
                typeColors[type],
                'transition-all duration-300',
                isHovering && 'scale-105'
              )}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
            {effort_level && (
              <Badge
                variant="outline"
                className="backdrop-blur-md bg-white/30 border-white/40 text-gray-700 transition-all duration-300"
              >
                {EFFORT_ESTIMATES[effort_level]}
              </Badge>
            )}
            {priority === 'urgent' && (
              <Badge
                variant="destructive"
                className="animate-pulse bg-gradient-to-r from-red-500 to-orange-500"
              >
                Urgent
              </Badge>
            )}
          </div>

          {deadline_at && (
            <div className="text-sm text-gray-600 font-medium bg-white/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/50">
              📅 {formatDeadline(deadline_at)}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-800 mb-3 leading-snug">
          {title}
        </h3>

        {/* Suggested next step */}
        {suggested_next_step && (
          <div className="mb-4 p-3 bg-blue-50/60 backdrop-blur-sm rounded-xl border border-blue-200/50 transition-all duration-300 hover:bg-blue-50/80">
            <p className="text-sm font-medium text-blue-800 mb-1">
              🎯 Next step:
            </p>
            <p className="text-sm text-blue-700">{suggested_next_step}</p>
          </div>
        )}

        {/* Original fragment (expandable) */}
        {original_fragment && (
          <div className="mb-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center gap-1"
            >
              <span className={cn(
                'transition-transform duration-300',
                isExpanded && 'rotate-90'
              )}>
                ▶
              </span>
              {isExpanded ? 'Hide' : 'Show'} original context
            </button>

            <div
              className={cn(
                'mt-2 overflow-hidden transition-all duration-500 ease-out',
                isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <div className="p-3 bg-gray-50/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <p className="text-sm text-gray-600 italic leading-relaxed">
                  &ldquo;{original_fragment}&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {children && (
          <div className="pt-4 border-t border-gray-200/30">
            {children}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
