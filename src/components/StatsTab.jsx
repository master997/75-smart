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
    a.download = `75-smart-rules-backup-${new Date().toISOString().split('T')[0]}.json`
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
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Current Day"
          value={Math.min(currentDay, 75)}
          sublabel="of 75"
          color="indigo"
        />
        <StatCard
          label="Current Streak"
          value={data.challenge.currentStreak}
          sublabel="days"
          color="green"
        />
        <StatCard
          label="Longest Streak"
          value={data.challenge.longestStreak}
          sublabel="days"
          color="amber"
        />
        <StatCard
          label="Total Resets"
          value={data.challenge.totalResets}
          sublabel="times"
          color="red"
        />
      </div>

      {/* Completion Rate */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Completion Rate</span>
          <span className="text-lg font-bold text-indigo-600">{completionRate}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {completeDays} complete days out of {totalDaysLogged} logged
        </p>
      </div>

      {/* Per-Rule Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Task Breakdown</h3>
        <div className="space-y-3">
          {ruleStats.map((rule) => (
            <div key={rule.id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 truncate pr-2">{rule.text}</span>
                <span className="text-gray-900 font-medium">{rule.percentage}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-400 transition-all duration-300"
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
        className="w-full py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
      >
        <span>↓</span>
        Export Data (JSON)
      </button>
    </div>
  )
}

function StatCard({ label, value, sublabel, color }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className={`rounded-lg p-4 ${colors[color]}`}>
      <p className="text-xs opacity-75">{label}</p>
      <p className="text-2xl font-bold">
        {value}
        <span className="text-sm font-normal ml-1">{sublabel}</span>
      </p>
    </div>
  )
}

export default StatsTab
