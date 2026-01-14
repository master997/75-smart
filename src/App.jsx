import { useState, useEffect } from 'react'
import { loadData, initializeData, isStorageAvailable, calculateCurrentDay, checkForReset, resetChallenge } from './utils/storage'
import TasksTab from './components/TasksTab'
import CalendarTab from './components/CalendarTab'
import StatsTab from './components/StatsTab'
import ResetModal from './components/ResetModal'

function App() {
  const [activeTab, setActiveTab] = useState('tasks')
  const [data, setData] = useState(null)
  const [storageError, setStorageError] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [missedDays, setMissedDays] = useState(0)

  useEffect(() => {
    if (!isStorageAvailable()) {
      setStorageError(true)
      return
    }

    const stored = loadData()
    if (stored) {
      // Check for reset condition
      const resetCheck = checkForReset(stored)
      if (resetCheck.needsReset) {
        setMissedDays(resetCheck.missedDays)
        setShowResetModal(true)
      }
      setData(stored)
    }
  }, [])

  const handleStartChallenge = (rules) => {
    const newData = initializeData(rules)
    setData(newData)
  }

  const handleResetAcknowledge = () => {
    const newData = resetChallenge(data)
    setData(newData)
    setShowResetModal(false)
  }

  if (storageError) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Storage Error</h1>
          <p className="text-gray-600">
            This app requires localStorage. Please use regular browsing mode.
          </p>
        </div>
      </div>
    )
  }

  const currentDay = data?.challenge?.startDate
    ? calculateCurrentDay(data.challenge.startDate)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">75 Smart Rules</h1>
              {data && (
                <p className="text-sm text-gray-500">
                  Day {Math.min(currentDay, 75)} of 75
                </p>
              )}
            </div>
            {data && (
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">
                  {data.challenge.currentStreak}
                </p>
                <p className="text-xs text-gray-500">day streak</p>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      {data && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex space-x-8">
              {[
                { id: 'tasks', label: 'Tasks' },
                { id: 'calendar', label: 'Calendar' },
                { id: 'stats', label: 'Stats' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {!data ? (
          <TasksTab
            data={data}
            setData={setData}
            onStartChallenge={handleStartChallenge}
          />
        ) : (
          <>
            {activeTab === 'tasks' && (
              <TasksTab data={data} setData={setData} />
            )}
            {activeTab === 'calendar' && (
              <CalendarTab data={data} />
            )}
            {activeTab === 'stats' && (
              <StatsTab data={data} />
            )}
          </>
        )}
      </main>

      {/* Reset Modal */}
      {showResetModal && (
        <ResetModal
          missedDays={missedDays}
          onAcknowledge={handleResetAcknowledge}
        />
      )}
    </div>
  )
}

export default App
