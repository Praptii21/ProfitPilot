import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Calendar, Plus, Trash2, ArrowLeft, Edit3, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'

export default function GoalsPage() {
  const [goals, setGoals] = useState([])
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [currentValue, setCurrentValue] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [tempCurrentValue, setTempCurrentValue] = useState('')

  // Load goals from local storage on mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('user_goals')
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals))
      } catch (e) {
        console.error("Error parsing goals", e)
      }
    }
  }, [])

  // Save goals to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('user_goals', JSON.stringify(goals))
  }, [goals])

  const handleAddGoal = (e) => {
    e.preventDefault()
    if (!title.trim() || !deadline) return

    const parsedTarget = targetValue.trim() !== '' ? parseFloat(targetValue) : null
    const parsedCurrent = currentValue.trim() !== '' ? parseFloat(currentValue) : (parsedTarget !== null ? 0 : null)

    const newGoal = {
      id: Date.now().toString(),
      title: title.trim(),
      deadline,
      targetValue: parsedTarget,
      currentValue: parsedCurrent,
      createdAt: new Date().toISOString()
    }
    
    setGoals([...goals, newGoal])
    setTitle('')
    setDeadline('')
    setTargetValue('')
    setCurrentValue('')
  }

  const handleDeleteGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id))
  }

  const startEditing = (goal) => {
    setEditingId(goal.id)
    setTempCurrentValue(goal.currentValue !== null ? goal.currentValue.toString() : '')
  }

  const saveCurrentValue = (id) => {
    const parsed = tempCurrentValue.trim() !== '' ? parseFloat(tempCurrentValue) : 0
    setGoals(goals.map(g => {
      if (g.id === id) {
        return { ...g, currentValue: parsed }
      }
      return g
    }))
    setEditingId(null)
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <TopBar />
      
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-3xl">
          
          <div className="mb-8 flex items-center gap-4">
            <Link to="/app" className="flex items-center justify-center h-10 w-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="text-indigo-600 dark:text-indigo-400" />
                Business Goals
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Set your targets and let ProfitPilot personalize its recommendations.
              </p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Form Section */}
            <div className="md:col-span-1">
              <form onSubmit={handleAddGoal} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <h2 className="text-sm font-semibold mb-4 text-slate-700 dark:text-slate-200">Add New Goal</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                      Goal Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      placeholder="e.g. Increase profit by 10%"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label htmlFor="targetValue" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                      Target Value (Optional)
                    </label>
                    <input
                      id="targetValue"
                      type="number"
                      step="any"
                      placeholder="e.g. 10 or 150000"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-800"
                    />
                  </div>

                  {targetValue.trim() !== '' && (
                    <div>
                      <label htmlFor="currentValue" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                        Current Value (Optional)
                      </label>
                      <input
                        id="currentValue"
                        type="number"
                        step="any"
                        placeholder="e.g. 2 or 50000"
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-800"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="deadline" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                      Deadline
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Calendar size={14} />
                      </div>
                      <input
                        id="deadline"
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-slate-800 [color-scheme:light] dark:[color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!title.trim() || !deadline}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Plus size={16} />
                    Save Goal
                  </button>
                </div>
              </form>
            </div>

            {/* List Section */}
            <div className="md:col-span-2">
              <div className="space-y-4">
                {goals.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-8 text-center">
                    <Target className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500 mb-3" />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">No goals set</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Get started by creating a new business goal.
                    </p>
                  </div>
                ) : (
                  goals.map((goal, index) => {
                    const hasProgress = goal.targetValue !== null && goal.targetValue !== undefined && goal.targetValue !== 0
                    const progressPercent = hasProgress
                      ? Math.min(100, Math.max(0, Math.round(((goal.currentValue || 0) / goal.targetValue) * 100)))
                      : 0

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={goal.id}
                        className="group flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-all hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                              <Target size={20} />
                            </div>
                            <div>
                              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                                {goal.title}
                              </h3>
                              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                <Calendar size={12} />
                                Target Date: {new Date(goal.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label="Delete Goal"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Progress Bar & Value Editor */}
                        {goal.targetValue !== null && goal.targetValue !== undefined && (
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <span>Progress:</span>
                                {editingId === goal.id ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      step="any"
                                      value={tempCurrentValue}
                                      onChange={(e) => setTempCurrentValue(e.target.value)}
                                      className="w-16 rounded border border-slate-300 dark:border-slate-700 bg-transparent px-1 py-0.5 text-xs focus:outline-none dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                    <span className="text-slate-400">/ {goal.targetValue}</span>
                                    <button
                                      onClick={() => saveCurrentValue(goal.id)}
                                      className="p-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                                    >
                                      <Check size={10} />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{goal.currentValue || 0}</span>
                                    <span className="text-slate-400">/ {goal.targetValue}</span>
                                    <button
                                      onClick={() => startEditing(goal)}
                                      className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                                    >
                                      <Edit3 size={10} />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
