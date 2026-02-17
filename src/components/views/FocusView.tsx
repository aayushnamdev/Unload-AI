'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VoiceRecorder } from '@/components/ui/VoiceRecorder'
import { TaskItem } from '@/components/ui/TaskItem'
import { Button } from '@/components/ui/button'
import { Loader2, CornerDownLeft, RotateCcw, ChevronDown } from 'lucide-react'

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

interface Task {
    id: string
    title: string
    priority: 'high' | 'medium' | 'low' | 'urgent'
    status: 'active' | 'done' | 'parked' | 'dropped'
    description?: string
    deadline_at?: string
    created_at?: string
}

// Detect time-of-day slot from task title/description for chronological sorting
function getTimeSlot(task: Task): number {
    const text = (task.title + ' ' + (task.description || '')).toLowerCase()
    if (/\bmorning\b|\bbreakfast\b|\bwake\b|\beach am\b|\b[6-9]am\b|\b6:\d\d|\b7:\d\d|\b8:\d\d|\b9:\d\d/.test(text)) return 0
    if (/\blunch\b|\bnoon\b|\bmidday\b|\bafternoon\b|\b1[0-2]:\d\d|\b1pm\b|\b2pm\b|\b3pm\b|\b12pm\b/.test(text)) return 1
    if (/\bdinner\b|\bevening\b|\bnight\b|\bsupper\b|\b[4-9]pm\b|\b10pm\b/.test(text)) return 2
    return 1
}

function sortByTime(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => getTimeSlot(a) - getTimeSlot(b))
}

function reorder<T>(arr: T[], fromIdx: number, toIdx: number): T[] {
    const next = [...arr]
    const [item] = next.splice(fromIdx, 1)
    next.splice(toIdx, 0, item)
    return next
}

export function FocusView() {
    const [isProcessing, setIsProcessing] = useState(false)
    const [activeTasks, setActiveTasks] = useState<Task[]>([])
    const [completedTasks, setCompletedTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [textInput, setTextInput] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [showCompleted, setShowCompleted] = useState(false)
    const [confirmReset, setConfirmReset] = useState(false)
    const [isResetting, setIsResetting] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-grow textarea up to 3 lines (used by both typing and programmatic updates)
    const resizeTextarea = (el: HTMLTextAreaElement) => {
        el.style.height = 'auto'
        const lineHeight = 20
        const maxHeight = lineHeight * 4 + 20 // 4 lines + padding
        el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
        el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
    }

    const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextInput(e.target.value)
        resizeTextarea(e.target)
    }

    // Resize when voice transcription sets text programmatically
    useEffect(() => {
        if (textareaRef.current) resizeTextarea(textareaRef.current)
    }, [textInput])

    // Local drag-reorder state
    const [draggingId, setDraggingId] = useState<string | null>(null)
    const [dragOverId, setDragOverId] = useState<string | null>(null)
    const [priorityOrder, setPriorityOrder] = useState<string[]>([])
    const [benchOrder, setBenchOrder] = useState<string[]>([])

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
            const active: Task[] = activeData.items || []
            const done: Task[] = doneData.items || []
            setActiveTasks(active)
            setCompletedTasks(done)
            // Reset order when tasks reload
            const high = sortByTime(active.filter(t => t.priority === 'high' || t.priority === 'urgent')).slice(0, 3)
            const bench = sortByTime([
                ...active.filter(t => t.priority !== 'high' && t.priority !== 'urgent'),
                ...sortByTime(active.filter(t => t.priority === 'high' || t.priority === 'urgent')).slice(3),
            ])
            setPriorityOrder(high.map(t => t.id))
            setBenchOrder(bench.map(t => t.id))
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    // Derived task lists
    const rawPriority = activeTasks.filter(t => t.priority === 'high' || t.priority === 'urgent')
    const rawBench = [
        ...activeTasks.filter(t => t.priority !== 'high' && t.priority !== 'urgent'),
        ...sortByTime(rawPriority).slice(3), // overflow beyond 3
    ]
    const priorityTasks = sortByTime(rawPriority).slice(0, 3)
    const benchTasks = sortByTime(rawBench)

    const applyOrder = (tasks: Task[], order: string[]) => {
        if (order.length === 0) return tasks
        return [...tasks].sort((a, b) => {
            const ai = order.indexOf(a.id)
            const bi = order.indexOf(b.id)
            if (ai === -1) return 1
            if (bi === -1) return -1
            return ai - bi
        })
    }

    const orderedPriority = applyOrder(priorityTasks, priorityOrder)
    const orderedBench = applyOrder(benchTasks, benchOrder)

    const handleDump = async (content: string, source: 'voice' | 'text') => {
        if (!content.trim()) return
        setIsProcessing(true)
        setError(null)
        try {
            const res = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, source, mode: 'focus' }),
            })
            if (res.ok) {
                setTextInput('')
                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto'
                    textareaRef.current.style.overflowY = 'hidden'
                }
                await fetchTasks()
            } else {
                const data = await res.json().catch(() => ({}))
                setError(data.error || 'Something went wrong. Please try again.')
            }
        } catch (e) {
            setError('Network error. Please check your connection.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCheck = async (id: string) => {
        const task = activeTasks.find(t => t.id === id)
        if (!task) return
        // Optimistic
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
        // Optimistic
        setCompletedTasks(prev => prev.filter(t => t.id !== id))
        setActiveTasks(prev => [{ ...task, status: 'active', priority: 'medium' }, ...prev])
        await fetch(`/api/items/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'focus', priority: 'medium' }),
        }).catch(() => fetchTasks())
    }

    const handleMoveToBench = async (id: string) => {
        setActiveTasks(prev => prev.map(t => t.id === id ? { ...t, priority: 'medium' } : t))
        await fetch(`/api/items/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priority: 'medium' }),
        }).catch(() => fetchTasks())
    }

    const handleMoveToFocus = async (id: string) => {
        // If priority full (3), bump last priority task to bench first
        if (orderedPriority.length >= 3) {
            const bumped = orderedPriority[orderedPriority.length - 1]
            await fetch(`/api/items/${bumped.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority: 'medium' }),
            }).catch(() => {})
            setActiveTasks(prev => prev.map(t => t.id === bumped.id ? { ...t, priority: 'medium' } : t))
        }
        setActiveTasks(prev => prev.map(t => t.id === id ? { ...t, priority: 'high' } : t))
        await fetch(`/api/items/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priority: 'high' }),
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
            setPriorityOrder([])
            setBenchOrder([])
        } finally {
            setIsResetting(false)
        }
    }

    // Cross-section drop
    const handleSectionDrop = async (e: React.DragEvent, targetPriority: 'high' | 'medium') => {
        e.preventDefault()
        const id = e.dataTransfer.getData('text/plain')
        if (!id) return
        if (targetPriority === 'high') {
            await handleMoveToFocus(id)
        } else {
            await handleMoveToBench(id)
        }
    }

    // Reorder within section
    const handleItemDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (draggingId && draggingId !== targetId) setDragOverId(targetId)
    }

    const handleItemDrop = (e: React.DragEvent, targetId: string, section: 'priority' | 'bench') => {
        e.preventDefault()
        e.stopPropagation()
        if (!draggingId || draggingId === targetId) return

        const inPriority = orderedPriority.some(t => t.id === draggingId)
        const fromSection = inPriority ? 'priority' : 'bench'

        if (fromSection === section) {
            const list = section === 'priority' ? orderedPriority : orderedBench
            const setOrder = section === 'priority' ? setPriorityOrder : setBenchOrder
            const ids = list.map(t => t.id)
            const from = ids.indexOf(draggingId)
            const to = ids.indexOf(targetId)
            if (from !== -1 && to !== -1) setOrder(reorder(ids, from, to))
        }
        setDraggingId(null)
        setDragOverId(null)
    }

    return (
        <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col h-full">

            {/* Compact Capture */}
            <div className="flex-none mb-5 flex flex-col items-center gap-3">
                <div className="relative">
                    {isProcessing && (
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
                    )}
                    <VoiceRecorder
                        onTranscription={(text) => setTextInput(text)}
                        isProcessing={isProcessing}
                    />
                </div>

                {error && <p className="text-xs text-destructive text-center">{error}</p>}

                <div className="relative w-full">
                    <textarea
                        ref={textareaRef}
                        value={textInput}
                        onChange={handleTextInput}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleDump(textInput, 'text')
                                if (textareaRef.current) {
                                    textareaRef.current.style.height = 'auto'
                                    textareaRef.current.style.overflowY = 'hidden'
                                }
                            }
                        }}
                        disabled={isProcessing}
                        placeholder="Add tasks..."
                        rows={1}
                        className="w-full resize-none rounded-2xl bg-secondary/30 border border-transparent pl-4 pr-10 py-2.5 text-sm focus:border-primary/50 focus:bg-background transition-all outline-none overflow-hidden leading-5"
                        style={{ minHeight: '40px' }}
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                            handleDump(textInput, 'text')
                            if (textareaRef.current) {
                                textareaRef.current.style.height = 'auto'
                                textareaRef.current.style.overflowY = 'hidden'
                            }
                        }}
                        disabled={!textInput.trim() || isProcessing}
                        className="absolute right-1 top-1 h-8 w-8 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary"
                    >
                        <CornerDownLeft className="w-4 h-4" />
                    </Button>
                </div>

                {/* Fresh Start */}
                <button
                    onClick={handleFreshStart}
                    disabled={isResetting}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full transition-all ${
                        confirmReset
                            ? 'bg-destructive/10 text-destructive border border-destructive/30'
                            : 'text-muted-foreground/40 hover:text-muted-foreground hover:bg-secondary/50'
                    }`}
                >
                    <RotateCcw className="w-3 h-3" />
                    {isResetting ? 'Clearing...' : confirmReset ? 'Tap again to confirm' : 'Fresh Start'}
                </button>
            </div>

            {/* Tasks */}
            {loading ? (
                <div className="flex justify-center py-10 flex-1">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto overflow-x-hidden custom-scrollbar pb-4">

                    {/* Priority Tasks — max 3 */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleSectionDrop(e, 'high')}
                        className="flex-shrink-0 border border-border rounded-2xl p-5 bg-card shadow-sm transition-colors hover:bg-card/90"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs font-semibold text-foreground/60 uppercase tracking-widest">Priority Tasks</h2>
                            <span className="text-[10px] text-muted-foreground/40 tabular-nums">{orderedPriority.length} / 3</span>
                        </div>
                        <div className="space-y-0.5">
                            {orderedPriority.length === 0 ? (
                                <p className="text-center py-6 text-muted-foreground/30 text-sm italic">Focus is clear.</p>
                            ) : (
                                <AnimatePresence>
                                    {orderedPriority.map(task => (
                                        <div
                                            key={task.id}
                                            onDragOver={(e) => handleItemDragOver(e, task.id)}
                                            onDrop={(e) => handleItemDrop(e, task.id, 'priority')}
                                            className={`rounded-lg transition-all ${dragOverId === task.id && draggingId !== task.id ? 'border-t-2 border-primary/60' : ''}`}
                                        >
                                            <TaskItem
                                                id={task.id}
                                                title={task.title}
                                                timeContext={cleanDescription(task.description)}
                                                deadline_at={task.deadline_at}
                                                section="priorities"
                                                focusSection="priority"
                                                onCheck={handleCheck as any}
                                                onMove={() => handleMoveToBench(task.id)}
                                                onDragStartCallback={setDraggingId}
                                                onDragEnd={() => { setDraggingId(null); setDragOverId(null) }}
                                            />
                                        </div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>

                    {/* Bench */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleSectionDrop(e, 'medium')}
                        className="flex-shrink-0 border border-border/40 rounded-2xl p-5 bg-muted/20 transition-colors hover:bg-muted/30"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs font-semibold text-muted-foreground/40 uppercase tracking-widest">Bench</h2>
                            <span className="text-[10px] text-muted-foreground/40 tabular-nums">{orderedBench.length}</span>
                        </div>
                        <div className="space-y-0.5">
                            {orderedBench.length === 0 ? (
                                <p className="text-center py-4 text-muted-foreground/25 text-sm italic">Bench is empty.</p>
                            ) : (
                                <AnimatePresence>
                                    {orderedBench.map(task => (
                                        <div
                                            key={task.id}
                                            onDragOver={(e) => handleItemDragOver(e, task.id)}
                                            onDrop={(e) => handleItemDrop(e, task.id, 'bench')}
                                            className={`rounded-lg transition-all ${dragOverId === task.id && draggingId !== task.id ? 'border-t-2 border-primary/30' : ''}`}
                                        >
                                            <TaskItem
                                                id={task.id}
                                                title={task.title}
                                                timeContext={cleanDescription(task.description)}
                                                deadline_at={task.deadline_at}
                                                section="later"
                                                focusSection="bench"
                                                dimmed
                                                onCheck={handleCheck as any}
                                                onMove={() => handleMoveToFocus(task.id)}
                                                onDragStartCallback={setDraggingId}
                                                onDragEnd={() => { setDraggingId(null); setDragOverId(null) }}
                                            />
                                        </div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>

                    {/* Completed Section */}
                    {completedTasks.length > 0 && (
                        <div className="flex-shrink-0 border border-border/30 rounded-2xl p-5 bg-muted/5">
                            <button
                                onClick={() => setShowCompleted(!showCompleted)}
                                className="flex items-center justify-between w-full"
                            >
                                <h2 className="text-xs font-semibold text-muted-foreground/40 uppercase tracking-widest">Completed</h2>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-muted-foreground/30">{completedTasks.length}</span>
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
