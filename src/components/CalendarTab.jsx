import { useState } from "react";
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
  isBefore,
  isAfter,
  startOfDay,
} from "date-fns";

function CalendarTab({ data }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const challengeStart = data.challenge.startDate
    ? parseISO(data.challenge.startDate)
    : null;

  const today = startOfDay(new Date());

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="p-2 text-gray-500 hover:text-white transition-colors"
      >
        ←
      </button>
      <h2 className="text-sm font-medium text-white tracking-wide">
        {format(currentMonth, "MMMM yyyy")}
      </h2>
      <button
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="p-2 text-gray-500 hover:text-white transition-colors"
      >
        →
      </button>
    </div>
  );

  const renderDays = () => {
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day, i) => (
          <div
            key={i}
            className="text-center text-xs text-gray-600 py-2 font-medium"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayKey = format(day, "yyyy-MM-dd");
        const dayLog = data.dailyLogs[dayKey];
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, today);
        const dayStart = startOfDay(day);

        // Determine if this day is within the challenge period
        const isInChallenge =
          challengeStart && !isBefore(dayStart, startOfDay(challengeStart));
        const isFutureDay = isAfter(dayStart, today);
        const isPastDay =
          isBefore(dayStart, today) && !isSameDay(dayStart, today);

        // Determine status
        let status = "outside"; // Not in challenge period
        let symbol = format(day, "d");

        if (isInChallenge) {
          if (isToday) {
            // Today always shows day number - day isn't over yet
            status = "today";
            symbol = format(day, "d");
          } else if (isFutureDay) {
            status = "future";
            symbol = "○";
          } else if (isPastDay && dayLog?.allComplete) {
            // Past day with all tasks complete
            status = "complete";
            symbol = "✓";
          } else if (isPastDay) {
            // Past day incomplete or no log - only mark X after day is over
            status = "incomplete";
            symbol = "✗";
          }
        }

        const clonedDay = day;

        days.push(
          <button
            key={dayKey}
            onClick={() =>
              isCurrentMonth && isInChallenge && setSelectedDay(clonedDay)
            }
            disabled={!isCurrentMonth || !isInChallenge}
            className={`
              aspect-square flex items-center justify-center text-sm rounded-md transition-all relative
              ${!isCurrentMonth ? "text-gray-800" : ""}
              ${isCurrentMonth && !isInChallenge ? "text-gray-700" : ""}
              ${status === "complete" ? "text-green-400 font-bold" : ""}
              ${status === "incomplete" ? "text-red-400" : ""}
              ${status === "future" ? "text-gray-600" : ""}
              ${status === "today" ? "ring-1 ring-white text-white" : ""}
              ${
                isCurrentMonth && isInChallenge
                  ? "hover:bg-gray-900 cursor-pointer"
                  : "cursor-default"
              }
            `}
          >
            {isCurrentMonth
              ? isInChallenge
                ? symbol
                : format(day, "d")
              : format(day, "d")}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-1">{rows}</div>;
  };

  const renderLegend = () => (
    <div className="mt-6 pt-4 border-t border-gray-800">
      <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">
        Legend
      </p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-bold">✓</span>
          <span className="text-gray-500">Complete</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-red-400">✗</span>
          <span className="text-gray-500">Incomplete</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">○</span>
          <span className="text-gray-500">Future</span>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="border border-gray-800 rounded-lg p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">
          Your Progress
        </p>
        {renderHeader()}
        {renderDays()}
        {renderCells()}
        {renderLegend()}

        <p className="text-xs text-gray-600 mt-4 text-center">
          Click any day to see details →
        </p>
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
  );
}

function DayDetailModal({ day, data, onClose }) {
  const dayKey = format(day, "yyyy-MM-dd");
  const dayLog = data.dailyLogs[dayKey];
  const isComplete = dayLog?.allComplete;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-950 border border-gray-800 rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-medium text-white">
              {format(day, "EEEE, MMMM d")}
            </h3>
            <p
              className={`text-sm mt-1 ${
                isComplete ? "text-green-400" : "text-red-400"
              }`}
            >
              {dayLog?.allComplete
                ? "✓ All tasks complete"
                : dayLog
                ? "✗ Partially complete"
                : "✗ No tasks completed"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-400 text-xl"
          >
            ×
          </button>
        </div>

        {dayLog ? (
          <div className="space-y-4">
            <div className="space-y-2">
              {data.rules.map((rule, index) => {
                const isCompleted = dayLog.completed.includes(rule.id);
                return (
                  <div
                    key={rule.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isCompleted ? "bg-gray-900" : "bg-gray-900/50"
                    }`}
                  >
                    <span
                      className={
                        isCompleted ? "text-green-400" : "text-red-400"
                      }
                    >
                      {isCompleted ? "✓" : "✗"}
                    </span>
                    <span className="text-gray-600 text-xs">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={
                        isCompleted ? "text-gray-300" : "text-gray-600"
                      }
                    >
                      {rule.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {dayLog.reflection && (
              <div className="mt-4 p-4 border-l-2 border-gray-700">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Reflection
                </p>
                <p className="text-sm text-gray-300">{dayLog.reflection}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">
            No activity recorded for this day.
          </p>
        )}

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 border border-gray-800 text-gray-400 rounded-lg hover:border-gray-700 hover:text-gray-300 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default CalendarTab;
