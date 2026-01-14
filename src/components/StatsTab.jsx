import { calculateCurrentDay } from '../utils/storage'

function StatsTab({ data }) {
  const currentDay = calculateCurrentDay(data.challenge.startDate)
  const totalDaysLogged = Object.keys(data.dailyLogs).length
  const completeDays = Object.values(data.dailyLogs).filter(log => log.allComplete).length

  // Calculate per-rule completion stats
  const ruleStats = data.rules.map((rule) => {
    const completedCount = Object.values(data.dailyLogs).filter(
      (log) => log.completed.includes(rule.id)
    ).length
    const percentage = totalDaysLogged > 0 ? Math.round((completedCount / totalDaysLogged) * 100) : 0
    return { ...rule, completedCount, percentage }
  })

  const handleExport = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      ...data,
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `75-smart-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const completionRate = totalDaysLogged > 0
    ? Math.round((completeDays / totalDaysLogged) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Current Day"
          value={Math.min(currentDay, 75)}
          sublabel="/ 75"
        />
        <StatCard
          label="Current Streak"
          value={data.challenge.currentStreak}
          sublabel="days"
        />
        <StatCard
          label="Longest Streak"
          value={data.challenge.longestStreak}
          sublabel="days"
        />
        <StatCard
          label="Total Resets"
          value={data.challenge.totalResets}
          sublabel="times"
        />
      </div>

      {/* Completion Rate */}
      <div className="border border-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Completion Rate</span>
          <span className="text-lg font-medium text-white">{completionRate}%</span>
        </div>
        <div className="h-[2px] bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-3">
          {completeDays} complete days out of {totalDaysLogged} logged
        </p>
      </div>

      {/* Per-Rule Breakdown */}
      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-4">Task Breakdown</h3>
        <div className="space-y-4">
          {ruleStats.map((rule, index) => (
            <div key={rule.id}>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400 truncate pr-2">
                  <span className="text-gray-600 mr-2">{String(index + 1).padStart(2, '0')}</span>
                  {rule.text}
                </span>
                <span className="text-white font-medium">{rule.percentage}%</span>
              </div>
              <div className="h-[2px] bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-500 transition-all duration-500"
                  style={{ width: `${rule.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <button
        onClick={handleExport}
        className="w-full py-3 border border-gray-800 text-gray-500 rounded-lg hover:border-gray-700 hover:text-gray-400 flex items-center justify-center gap-2 transition-all"
      >
        <span>↓</span>
        Export Data
      </button>
    </div>
  )
}

function StatCard({ label, value, sublabel }) {
  return (
    <div className="border border-gray-800 rounded-lg p-4">
      <p className="text-xs text-gray-600 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-medium text-white mt-1">
        {value}
        <span className="text-sm text-gray-600 ml-1">{sublabel}</span>
      </p>
    </div>
  )
}

export default StatsTab
