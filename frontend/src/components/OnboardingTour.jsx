import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'

const TOUR_STEPS = [
  {
    target: '#tour-upload',
    title: 'Upload Business Data',
    content: 'Start by uploading your invoices, Excel sheets, or CSV ledger data. ProfitPilot will automatically extract and structure your numbers.',
    position: 'bottom'
  },
  {
    target: '#tour-goals',
    title: 'Set Business Goals',
    content: 'Define target metrics and deadlines (e.g. increase margin by 5% by next month). Recommendations will customize to these targets.',
    position: 'bottom'
  },
  {
    target: '#tour-recommendations',
    title: 'Personalized Insights',
    content: 'Review automated, goal-specific recommendations with detailed estimated recoveries. Click any card to get a deep-dive explanation.',
    position: 'right'
  },
  {
    target: '#tour-chat',
    title: 'Consult Gemma',
    content: 'Ask any question about your financial performance, test what-if scenarios, or drafts payment reminders with your AI Business Advisor.',
    position: 'left'
  }
]

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [coords, setCoords] = useState(null)

  useEffect(() => {
    // Check if user has already completed the onboarding
    const completed = localStorage.getItem('onboarding_done')
    if (!completed) {
      // Start tour after a brief delay so UI mounts fully
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      const step = TOUR_STEPS[currentStep]
      const element = document.querySelector(step.target)
      if (element) {
        const rect = element.getBoundingClientRect()
        // Smoothly scroll to the element if it's off-screen
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        
        // Let scroll finish, then calculate again
        setTimeout(() => {
          const updatedRect = element.getBoundingClientRect()
          setCoords({
            top: updatedRect.top + window.scrollY,
            left: updatedRect.left + window.scrollX,
            width: updatedRect.width,
            height: updatedRect.height
          })
        }, 300)
      } else {
        // Fallback to center screen if element is not found
        setCoords(null)
      }
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [isOpen, currentStep])

  if (!isOpen) return null

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem('onboarding_done', 'true')
    setIsOpen(false)
  }

  const stepInfo = TOUR_STEPS[currentStep]

  // Calculate tooltip placement
  const getTooltipStyle = () => {
    if (!coords) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 50
      }
    }

    const margin = 16
    const tooltipWidth = 320
    const tooltipHeight = 200

    switch (stepInfo.position) {
      case 'bottom':
        return {
          position: 'absolute',
          top: coords.top + coords.height + margin,
          left: coords.left + (coords.width / 2) - (tooltipWidth / 2),
          width: tooltipWidth,
          zIndex: 50
        }
      case 'left':
        return {
          position: 'absolute',
          top: coords.top + (coords.height / 2) - (tooltipHeight / 2),
          left: coords.left - tooltipWidth - margin,
          width: tooltipWidth,
          zIndex: 50
        }
      case 'right':
        return {
          position: 'absolute',
          top: coords.top + (coords.height / 2) - (tooltipHeight / 2),
          left: coords.left + coords.width + margin,
          width: tooltipWidth,
          zIndex: 50
        }
      case 'top':
      default:
        return {
          position: 'absolute',
          top: coords.top - tooltipHeight - margin,
          left: coords.left + (coords.width / 2) - (tooltipWidth / 2),
          width: tooltipWidth,
          zIndex: 50
        }
    }
  }

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden h-full w-full">
      {/* Background Mask */}
      {coords && (
        <div
          className="absolute border border-indigo-500 rounded-lg pointer-events-auto transition-all duration-300 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)]"
          style={{
            top: coords.top - 4,
            left: coords.left - 4,
            width: coords.width + 8,
            height: coords.height + 8
          }}
        />
      )}

      {/* Tooltip Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={getTooltipStyle()}
        className="pointer-events-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl text-slate-900 dark:text-slate-100 flex flex-col gap-3"
      >
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-bold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <Sparkles size={14} />
            {stepInfo.title}
          </h3>
          <button
            onClick={handleComplete}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {stepInfo.content}
        </p>

        <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100 dark:border-slate-800/50">
          <span className="text-[10px] text-slate-400 font-medium">
            Step {currentStep + 1} of {TOUR_STEPS.length}
          </span>
          <div className="flex items-center gap-1.5">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft size={12} />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
