import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
} from 'date-fns'

function CalendarTab({ data }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="p-2 hover:bg-gray-100 rounded-lg"
      >
        ←
      </button>
      <h2 className="text-lg font-semibold text-gray-900">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <button
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="p-2 hover:bg-gray-100 rounded-lg"
      >
        →
      </button>
    </div>
  )

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
    )
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate

    const challengeStart = data.challenge.startDate
      ? parseISO(data.challenge.startDate)
      : null

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayKey = format(day, 'yyyy-MM-dd')
        const dayLog = data.dailyLogs[dayKey]
        const isCurrentMonth = isSameMonth(day, monthStart)
        const isToday = isSameDay(day, new Date())
        const isInChallenge = challengeStart && day >= challengeStart

        let status = 'none'
        if (isInChallenge && dayLog) {
          status = dayLog.allComplete ? 'complete' : 'incomplete'
        } else if (isInChallenge && day < new Date()) {
          status = 'missed'
        }

        const clonedDay = day

        days.push(
          <button
            key={dayKey}
            onClick={() => isCurrentMonth && setSelectedDay(clonedDay)}
            disabled={!isCurrentMonth}
            className={`
              aspect-square p-1 text-sm rounded-lg transition-all
              ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
              ${isToday ? 'ring-2 ring-indigo-500' : ''}
              ${status === 'complete' ? 'bg-green-100 text-green-700' : ''}
              ${status === 'incomplete' ? 'bg-amber-100 text-amber-700' : ''}
              ${status === 'missed' ? 'bg-red-50 text-red-400' : ''}
              ${isCurrentMonth && status === 'none' ? 'hover:bg-gray-100' : ''}
            `}
          >
            {format(day, 'd')}
          </button>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      )
      days = []
    }
    return <div className="space-y-1">{rows}</div>
  }

  const renderLegend = () => (
    <div className="flex justify-center gap-4 mt-4 text-xs">
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-green-100 rounded" />
        <span className="text-gray-600">Complete</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-amber-100 rounded" />
        <span className="text-gray-600">Partial</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 bg-red-50 rounded" />
        <span className="text-gray-600">Missed</span>
      </div>
    </div>
  )

  return (
    <div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
        {renderLegend()}
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <DayDetailModal
          day={selectedDay}
          data={data}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}

function DayDetailModal({ day, data, onClose }) {
  const dayKey = format(day, 'yyyy-MM-dd')
  const dayLog = data.dailyLogs[dayKey]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {format(day, 'EEEE, MMMM d')}
            </h3>
            <p className="text-sm text-gray-500">
              {dayLog?.allComplete ? 'All tasks complete' : dayLog ? 'Partially complete' : 'No data'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {dayLog ? (
          <div className="space-y-3">
            <div className="space-y-2">
              {data.rules.map((rule) => {
                const isCompleted = dayLog.completed.includes(rule.id)
                return (
                  <div
                    key={rule.id}
                    className={`flex items-center gap-2 p-2 rounded ${
                      isCompleted ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                  >
                    <span className={isCompleted ? 'text-green-600' : 'text-gray-400'}>
                      {isCompleted ? '✓' : '○'}
                    </span>
                    <span className={isCompleted ? 'text-green-700' : 'text-gray-500'}>
                      {rule.text}
                    </span>
                  </div>
                )
              })}
            </div>

            {dayLog.reflection && (
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                <p className="text-xs font-medium text-indigo-600 mb-1">Reflection</p>
                <p className="text-sm text-indigo-900">{dayLog.reflection}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No activity recorded for this day.
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default CalendarTab
