import { useState, useEffect } from 'react'
import { saveData, getTodayKey, DEFAULT_RULES } from '../utils/storage'
import quotes from '../../quotes.json'

function TasksTab({ data, setData, onStartChallenge }) {
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])

  // Onboarding: No data yet
  if (!data) {
    return <Onboarding onStart={onStartChallenge} />
  }

  const todayKey = getTodayKey()
  const todayLog = data.dailyLogs[todayKey] || { completed: [], allComplete: false, reflection: '' }
  const completedIds = todayLog.completed

  const handleToggleTask = (ruleId) => {
    const newCompleted = completedIds.includes(ruleId)
      ? completedIds.filter((id) => id !== ruleId)
      : [...completedIds, ruleId]

    const allComplete = newCompleted.length === data.rules.length

    const newData = {
      ...data,
      dailyLogs: {
        ...data.dailyLogs,
        [todayKey]: {
          ...todayLog,
          completed: newCompleted,
          allComplete,
        },
      },
      challenge: {
        ...data.challenge,
        currentStreak: allComplete
          ? data.challenge.currentStreak + (todayLog.allComplete ? 0 : 1)
          : todayLog.allComplete
          ? data.challenge.currentStreak - 1
          : data.challenge.currentStreak,
        longestStreak: allComplete
          ? Math.max(data.challenge.longestStreak, data.challenge.currentStreak + (todayLog.allComplete ? 0 : 1))
          : data.challenge.longestStreak,
      },
    }

    saveData(newData)
    setData(newData)
  }

  const progress = (completedIds.length / data.rules.length) * 100

  return (
    <div className="space-y-6">
      {/* Quote */}
      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
        <p className="text-indigo-900 italic">"{quote.text}"</p>
        <p className="text-indigo-600 text-sm mt-1">— {quote.author}</p>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Today's Progress</span>
          <span>{completedIds.length}/{data.rules.length}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {data.rules.map((rule) => {
          const isCompleted = completedIds.includes(rule.id)
          return (
            <label
              key={rule.id}
              className={`flex items-center p-4 bg-white rounded-lg border cursor-pointer transition-all ${
                isCompleted
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={() => handleToggleTask(rule.id)}
                className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span
                className={`ml-3 ${
                  isCompleted ? 'text-green-700 line-through' : 'text-gray-700'
                }`}
              >
                {rule.text}
              </span>
            </label>
          )
        })}
      </div>

      {/* All Complete Message */}
      {todayLog.allComplete && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-700 font-medium">
            All tasks complete for today!
          </p>
        </div>
      )}
    </div>
  )
}

function Onboarding({ onStart }) {
  const [rules, setRules] = useState(DEFAULT_RULES)

  const handleStart = () => {
    if (rules.length < 3) {
      alert('Please add at least 3 rules')
      return
    }
    onStart(rules)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to 75 Smart Rules
        </h2>
        <p className="text-gray-600">
          Define 3-8 daily rules for your 75-day challenge.
          <br />
          Here's a suggested template for knowledge workers:
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="space-y-2">
          {rules.map((rule, index) => (
            <div key={rule.id} className="flex items-center gap-2">
              <span className="text-gray-400 text-sm w-6">{index + 1}.</span>
              <input
                type="text"
                value={rule.text}
                onChange={(e) => {
                  const newRules = [...rules]
                  newRules[index] = { ...rule, text: e.target.value }
                  setRules(newRules)
                }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {rules.length > 3 && (
                <button
                  onClick={() => setRules(rules.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700 px-2"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {rules.length < 8 && (
          <button
            onClick={() =>
              setRules([...rules, { id: Date.now(), text: '' }])
            }
            className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm"
          >
            + Add another rule
          </button>
        )}
      </div>

      <button
        onClick={handleStart}
        className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Start 75-Day Challenge
      </button>
    </div>
  )
}

export default TasksTab
