'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Check, GripVertical } from 'lucide-react'

export interface TaskItemProps {
    id: string
    title: string
    timeContext?: string
    deadline_at?: string
    section: 'priorities' | 'parked' | 'later'
    focusSection?: 'priority' | 'bench'
    organizerFilter?: 'today' | 'upcoming' | 'someday'
    dimmed?: boolean
    onSchedule?: (id: string, date: string | null) => void
    isCompleted?: boolean
    onCheck: (id: string, section: 'priorities' | 'parked' | 'later') => void
    onMove: (id: string, action: 'park' | 'drop', fromSection: 'priorities' | 'parked' | 'later', date?: string) => void
    onDragStartCallback?: (id: string) => void
    onDragEnd?: () => void
}

function formatDeadline(iso: string): string {
    const date = new Date(iso)
    const now = new Date()
    const todayEnd = new Date(now)
    todayEnd.setHours(23, 59, 59, 999)
    const tomorrowEnd = new Date(now)
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1)
    tomorrowEnd.setHours(23, 59, 59, 999)

    const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

    if (date <= todayEnd) return `Today${date.getMinutes() || date.getHours() !== 23 ? ', ' + timeStr : ''}`
    if (date <= tomorrowEnd) return `Tomorrow, ${timeStr}`

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
        (date.getHours() !== 9 || date.getMinutes() !== 0 ? ', ' + timeStr : '')
}

export function TaskItem({
    id,
    title,
    timeContext,
    deadline_at,
    section,
    focusSection,
    organizerFilter,
    dimmed = false,
    onSchedule,
    isCompleted,
    onCheck,
    onMove,
    onDragStartCallback,
    onDragEnd,
}: TaskItemProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [isChecked, setIsChecked] = useState(isCompleted || false)

    useEffect(() => {
        setIsChecked(isCompleted || false)
    }, [isCompleted])

    const handleCheck = () => {
        setIsChecked(!isChecked)
        setTimeout(() => onCheck(id, section), 400)
    }

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (isChecked) { e.preventDefault(); return }
        e.dataTransfer.setData('text/plain', id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStartCallback?.(id)
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            draggable={!isChecked}
            onDragStart={handleDragStart as any}
            onDragEnd={() => onDragEnd?.()}
            className={cn(
                "group relative flex items-center gap-3 py-2 px-2 rounded-lg transition-all duration-150 ease-out cursor-default select-none",
                isHovered && "bg-black/5 dark:bg-white/5",
                isChecked && "opacity-40",
                dimmed && "opacity-60"
            )}
        >
            {/* Drag Handle */}
            <div className={cn(
                "flex-shrink-0 text-muted-foreground/20 transition-opacity cursor-grab active:cursor-grabbing",
                isHovered ? "opacity-100" : "opacity-0"
            )}>
                <GripVertical className="w-3.5 h-3.5" />
            </div>

            {/* Checkbox */}
            <button
                onClick={handleCheck}
                className={cn(
                    "flex-shrink-0 w-5 h-5 rounded-[5px] border-[1.5px] transition-all flex items-center justify-center focus:outline-none",
                    isChecked
                        ? "bg-primary border-primary"
                        : "border-gray-300 dark:border-gray-600 group-hover:border-primary/50"
                )}
            >
                {isChecked && (
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </motion.div>
                )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className={cn(
                    "text-[14px] leading-snug break-words transition-colors",
                    dimmed ? "font-normal" : "font-medium",
                    isChecked ? "text-muted-foreground line-through" : "text-foreground"
                )}>
                    {title}
                </p>

                {/* Meta row: time context + deadline */}
                {(timeContext || deadline_at) && (
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {timeContext && (
                            <span className="text-[11px] text-muted-foreground/65">
                                {timeContext}
                            </span>
                        )}
                        {deadline_at && (
                            <span className="text-[11px] text-muted-foreground/65 tabular-nums">
                                {formatDeadline(deadline_at)}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Focus Mode Actions */}
            {focusSection && (
                <div className={cn(
                    "flex-shrink-0 transition-opacity duration-150",
                    isHovered ? "opacity-100" : "opacity-0"
                )}>
                    {focusSection === 'priority' ? (
                        <button
                            onClick={() => onMove(id, 'drop', section)}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                        >
                            → Bench
                        </button>
                    ) : (
                        <button
                            onClick={() => onMove(id, 'drop', section)}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/70 hover:bg-primary/20 hover:text-primary transition-all"
                        >
                            ↑ Focus
                        </button>
                    )}
                </div>
            )}

            {/* Organizer Move Actions */}
            {organizerFilter && onSchedule && (
                <div className={cn(
                    "flex-shrink-0 flex items-center gap-1 transition-opacity duration-150",
                    isHovered ? "opacity-100" : "opacity-0"
                )}>
                    {organizerFilter !== 'today' && (
                        <button
                            onClick={() => onSchedule(id, new Date().toISOString())}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/70 hover:bg-primary/20 hover:text-primary transition-all"
                        >
                            Today
                        </button>
                    )}
                    {organizerFilter !== 'upcoming' && (
                        <button
                            onClick={() => {
                                const tomorrow = new Date()
                                tomorrow.setDate(tomorrow.getDate() + 1)
                                tomorrow.setHours(9, 0, 0, 0)
                                onSchedule(id, tomorrow.toISOString())
                            }}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                        >
                            Tomorrow
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    )
}
