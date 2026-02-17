'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskItem } from '@/components/ui/TaskItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VoiceRecorder } from '@/components/ui/VoiceRecorder'
import { Loader2, Plus, Inbox, ChevronDown, RotateCcw } from 'lucide-react'

interface Task {
    id: string
    title: string
    priority: 'high' | 'medium' | 'low' | 'urgent'
    status: 'active' | 'done' | 'parked' | 'dropped'
    description?: string
    deadline_at?: string
    created_at: string
}

type ViewMode = 'today' | 'upcoming' | 'both'

// Strip metadata tags injected into description by the AI pipeline
function cleanDescription(desc?: string): string | undefined {
    if (!desc) return undefined
    const cleaned = desc
        .replace(/\[Tags:[^\]]*\]/gi, '')
        .replace(/\[When:[^\]]*\]/gi, '')
        .replace(/\[Time:[^\]]*\]/gi, '')
        .replace(/#\w+/g, '')
        .trim()
    return cleaned || undefined
}

export function OrganizerView() {
    const [activeTasks, setActiveTasks] = useState<Task[]>([])
    const [completedTasks, setCompletedTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<ViewMode>('both')
    const [quickAddText, setQuickAddText] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [showCompleted, setShowCompleted] = useState(false)
    const [confirmReset, setConfirmReset] = useState(false)
    const [isResetting, setIsResetting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dragOverSection, setDragOverSection] = useState<'today' | 'upcoming' | null>(null)

    useEffect(() => { fetchTasks() }, [])

    const fetchTasks = async () => {
        try {
            setLoading(true)
            const [activeRes, doneRes] = await Promise.all([
                fetch('/api/items?status=active'),
                fetch('/api/items?status=done'),
            ])
            const activeData = await activeRes.json()
            const doneData = await doneRes.json()
            setActiveTasks(activeData.items || [])
            setCompletedTasks(doneData.items || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (content: string, source: 'text' | 'voice') => {
        if (!content.trim()) return
        setIsProcessing(true)
        setError(null)
        try {
            const res = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, source, mode: 'organizer' }),
            })
            if (res.ok) {
                setQuickAddText('')
                await fetchTasks()
            } else {
                const data = await res.json().catch(() => ({}))
                setError(data.error || 'Something went wrong.')
            }
        } catch (e) {
            setError('Network error.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCheck = async (id: string) => {
        const task = activeTasks.find(t => t.id === id)
        if (!task) return
        setActiveTasks(prev => prev.filter(t => t.id !== id))
        setCompletedTasks(prev => [{ ...task, status: 'done' }, ...prev])
        await fetch(`/api/items/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'done' }),
        }).catch(() => fetchTasks())
    }

    const handleRestore = async (id: string) => {
        const task = completedTasks.find(t => t.id === id)
        if (!task) return
        setCompletedTasks(prev => prev.filter(t => t.id !== id))
        setActiveTasks(prev => [{ ...task, status: 'active' }, ...prev])
        await fetch(`/api/items/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'focus' }),
        }).catch(() => fetchTasks())
    }

    const handleSectionDrop = async (e: React.DragEvent, target: 'today' | 'upcoming') => {
        e.preventDefault()
        setDragOverSection(null)
        const id = e.dataTransfer.getData('text/plain')
        if (!id) return
        if (target === 'upcoming') {
            // Move to tomorrow 9am
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            tomorrow.setHours(9, 0, 0, 0)
            await handleSchedule(id, tomorrow.toISOString())
        } else {
            // Move to today — clear deadline so it falls into Today bucket
            await handleSchedule(id, null)
        }
    }

    const handleSchedule = async (id: string, date: string | null) => {
        setActiveTasks(prev =>
            prev.map(t => t.id === id ? { ...t, deadline_at: date ?? undefined } : t)
        )
        await fetch(`/api/items/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deadline_at: date }),
        }).catch(() => fetchTasks())
    }

    const handleFreshStart = async () => {
        if (!confirmReset) {
            setConfirmReset(true)
            setTimeout(() => setConfirmReset(false), 3000)
            return
        }
        setIsResetting(true)
        setConfirmReset(false)
        try {
            await fetch('/api/items/reset', { method: 'POST' })
            setActiveTasks([])
            setCompletedTasks([])
        } finally {
            setIsResetting(false)
        }
    }

    // Partition — no deadline goes into Today
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const todayTasks = activeTasks.filter(t =>
        !t.deadline_at || new Date(t.deadline_at) <= todayEnd
    )
    const upcomingTasks = activeTasks.filter(t =>
        t.deadline_at && new Date(t.deadline_at) > todayEnd
    )

    const showToday = viewMode === 'today' || viewMode === 'both'
    const showUpcoming = viewMode === 'upcoming' || viewMode === 'both'

    return (
        <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col h-full">

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Organizer</h1>
                    <p className="text-muted-foreground text-sm">Everything in its right place.</p>
                </div>
                <button
                    onClick={handleFreshStart}
                    disabled={isResetting}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all mt-1 ${
                        confirmReset
                            ? 'bg-destructive/10 text-destructive border border-destructive/30'
                            : 'text-muted-foreground/40 hover:text-muted-foreground hover:bg-secondary/50'
                    }`}
                >
                    <RotateCcw className="w-3 h-3" />
                    {isResetting ? 'Clearing...' : confirmReset ? 'Tap again' : 'Fresh Start'}
                </button>
            </div>

            {/* Capture Row */}
            <div className="mb-4 flex items-center gap-3">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                        <Plus className="w-4 h-4" />
                    </div>
                    <Input
                        disabled={isProcessing}
                        value={quickAddText}
                        onChange={(e) => setQuickAddText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd(quickAddText, 'text')}
                        placeholder="New task..."
                        className="pl-9 pr-16 py-5 text-sm bg-white/50 backdrop-blur border-muted/40 focus:border-primary/50 transition-all shadow-sm rounded-xl"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center">
                        {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleAdd(quickAddText, 'text')}
                                disabled={!quickAddText.trim()}
                                className="text-xs h-7 px-2"
                            >
                                Add
                            </Button>
                        )}
                    </div>
                </div>
                <VoiceRecorder
                    onTranscription={(text) => handleAdd(text, 'voice')}
                    isProcessing={isProcessing}
                    compact
                />
            </div>

            {/* Toggle */}
            <div className="flex justify-center mb-5">
                <div className="flex bg-secondary/50 p-1 rounded-lg">
                    {(['today', 'both', 'upcoming'] as const).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                                viewMode === mode
                                    ? 'bg-white shadow-sm text-foreground dark:bg-secondary'
                                    : 'text-muted-foreground hover:text-foreground/80'
                            }`}
                        >
                            {mode === 'both' ? 'Both' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {error && <p className="text-xs text-destructive mb-3 text-center">{error}</p>}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-10 bg-muted/20 animate-pulse rounded-xl" />
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto overflow-x-hidden custom-scrollbar pb-4">

                    {/* TODAY */}
                    {showToday && (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOverSection('today') }}
                            onDragLeave={() => setDragOverSection(null)}
                            onDrop={(e) => handleSectionDrop(e, 'today')}
                            className={`flex-shrink-0 border rounded-2xl p-5 backdrop-blur-sm transition-all ${
                                dragOverSection === 'today'
                                    ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                                    : 'border-border/60 bg-card/30 hover:bg-card/40'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Today</h2>
                                <span className="text-[10px] text-muted-foreground/40 tabular-nums">{todayTasks.length}</span>
                            </div>
                            {todayTasks.length === 0 ? (
                                <div className="flex items-center justify-center gap-2 py-5 text-muted-foreground/25">
                                    <Inbox className="w-4 h-4" />
                                    <span className="text-xs italic">Nothing due today.</span>
                                </div>
                            ) : (
                                <div className="space-y-0.5">
                                    <AnimatePresence>
                                        {todayTasks.map(task => (
                                            <TaskItem
                                                key={task.id}
                                                id={task.id}
                                                title={task.title}
                                                timeContext={cleanDescription(task.description)}
                                                deadline_at={task.deadline_at}
                                                section="priorities"
                                                organizerFilter="today"
                                                onSchedule={handleSchedule}
                                                onCheck={handleCheck as any}
                                                onMove={() => {}}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    )}

                    {/* UPCOMING */}
                    {showUpcoming && (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOverSection('upcoming') }}
                            onDragLeave={() => setDragOverSection(null)}
                            onDrop={(e) => handleSectionDrop(e, 'upcoming')}
                            className={`flex-shrink-0 border rounded-2xl p-5 backdrop-blur-sm transition-all ${
                                dragOverSection === 'upcoming'
                                    ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
                                    : 'border-border/40 bg-card/20 hover:bg-card/30'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest">Upcoming</h2>
                                <span className="text-[10px] text-muted-foreground/40 tabular-nums">{upcomingTasks.length}</span>
                            </div>
                            {upcomingTasks.length === 0 ? (
                                <div className="flex items-center justify-center gap-2 py-5 text-muted-foreground/25">
                                    <Inbox className="w-4 h-4" />
                                    <span className="text-xs italic">Nothing scheduled ahead.</span>
                                </div>
                            ) : (
                                <div className="space-y-0.5">
                                    <AnimatePresence>
                                        {upcomingTasks.map(task => (
                                            <TaskItem
                                                key={task.id}
                                                id={task.id}
                                                title={task.title}
                                                timeContext={cleanDescription(task.description)}
                                                deadline_at={task.deadline_at}
                                                section="priorities"
                                                organizerFilter="upcoming"
                                                onSchedule={handleSchedule}
                                                onCheck={handleCheck as any}
                                                onMove={() => {}}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    )}

                    {/* COMPLETED */}
                    {completedTasks.length > 0 && (
                        <div className="flex-shrink-0 border border-border/20 rounded-2xl p-5 bg-muted/5">
                            <button
                                onClick={() => setShowCompleted(!showCompleted)}
                                className="flex items-center justify-between w-full"
                            >
                                <h2 className="text-xs font-semibold text-muted-foreground/40 uppercase tracking-widest">Completed</h2>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-muted-foreground/30 tabular-nums">{completedTasks.length}</span>
                                    <ChevronDown className={`w-3 h-3 text-muted-foreground/30 transition-transform duration-200 ${showCompleted ? 'rotate-180' : ''}`} />
                                </div>
                            </button>
                            <AnimatePresence>
                                {showCompleted && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-3 space-y-0.5">
                                            {completedTasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/20 group transition-colors"
                                                >
                                                    <span className="text-[13px] text-muted-foreground/40 line-through truncate flex-1 min-w-0">
                                                        {task.title}
                                                    </span>
                                                    <button
                                                        onClick={() => handleRestore(task.id)}
                                                        className="ml-3 shrink-0 text-[10px] text-muted-foreground/30 hover:text-primary opacity-0 group-hover:opacity-100 transition-all px-2 py-0.5 rounded-full hover:bg-primary/10"
                                                    >
                                                        Restore
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                </div>
            )}
        </div>
    )
}
