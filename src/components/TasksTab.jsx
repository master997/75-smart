import { useState } from "react";
import { format } from "date-fns";
import { saveData, getTodayKey, DEFAULT_RULES, checkForWarning } from "../utils/storage";
import { RulesEditor } from "./ui/RulesEditor";
import quotes from "../../quotes.json";

function TasksTab({ data, setData, onStartChallenge }) {
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);
  const [warningDismissed, setWarningDismissed] = useState(false);

  if (!data) {
    return <Onboarding onStart={onStartChallenge} />;
  }

  const todayKey = getTodayKey();
  const todayLog = data.dailyLogs[todayKey] || { completed: [], allComplete: false, reflection: "" };
  const completedIds = todayLog.completed;
  const warningCheck = checkForWarning(data);
  const showWarning = warningCheck.showWarning && !warningDismissed;

  const handleToggleTask = (ruleId) => {
    const newCompleted = completedIds.includes(ruleId)
      ? completedIds.filter((id) => id !== ruleId)
      : [...completedIds, ruleId];

    const allComplete = newCompleted.length === data.rules.length;
    const wasComplete = todayLog.allComplete;

    const streakDelta = allComplete && !wasComplete ? 1 : !allComplete && wasComplete ? -1 : 0;

    const newData = {
      ...data,
      dailyLogs: {
        ...data.dailyLogs,
        [todayKey]: { ...todayLog, completed: newCompleted, allComplete },
      },
      challenge: {
        ...data.challenge,
        currentStreak: data.challenge.currentStreak + streakDelta,
        longestStreak: Math.max(
          data.challenge.longestStreak,
          data.challenge.currentStreak + streakDelta
        ),
      },
    };

    saveData(newData);
    setData(newData);
  };

  const handleReflectionChange = (e) => {
    const newData = {
      ...data,
      dailyLogs: {
        ...data.dailyLogs,
        [todayKey]: { ...todayLog, reflection: e.target.value },
      },
    };
    saveData(newData);
    setData(newData);
  };

  return (
    <div className="space-y-8">
      {/* Warning Banner */}
      {showWarning && (
        <WarningBanner onDismiss={() => setWarningDismissed(true)} />
      )}

      {/* Quote */}
      <Quote text={quote.text} author={quote.author} />

      {/* Task List */}
      <TaskList
        rules={data.rules}
        completedIds={completedIds}
        onToggle={handleToggleTask}
      />

      {/* All Complete Message */}
      {todayLog.allComplete && <CompletionMessage />}

      {/* Reflection */}
      <ReflectionInput
        value={todayLog.reflection}
        onChange={handleReflectionChange}
      />
    </div>
  );
}

// Sub-components
function WarningBanner({ onDismiss }) {
  return (
    <div className="bg-amber-950/30 border border-amber-800 rounded-lg p-4 flex items-start gap-3">
      <span className="text-amber-500 text-lg">⚠</span>
      <div className="flex-1">
        <p className="text-amber-200 text-sm font-medium">You missed yesterday</p>
        <p className="text-amber-400/80 text-xs mt-1">
          Miss another day and your challenge resets to Day 0.
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-amber-600 hover:text-amber-400 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

function Quote({ text, author }) {
  return (
    <div className="border-l-2 border-gray-800 pl-4 py-2">
      <p className="text-gray-400 text-sm italic leading-relaxed">"{text}"</p>
      <p className="text-gray-600 text-xs mt-2">— {author}</p>
    </div>
  );
}

function TaskList({ rules, completedIds, onToggle }) {
  return (
    <div className="space-y-3">
      {rules.map((rule, index) => {
        const isCompleted = completedIds.includes(rule.id);
        return (
          <label
            key={rule.id}
            className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
              isCompleted
                ? "border-gray-700 bg-gray-900/50"
                : "border-gray-800 hover:border-gray-700 bg-transparent"
            }`}
          >
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={() => onToggle(rule.id)}
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-gray-600 text-xs mr-2">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={`text-sm ${isCompleted ? "text-gray-500 line-through" : "text-gray-200"}`}>
                {rule.text}
              </span>
            </div>
          </label>
        );
      })}
    </div>
  );
}

function CompletionMessage() {
  return (
    <div className="text-center py-6 border border-gray-800 rounded-lg">
      <p className="text-white font-medium">All tasks complete</p>
      <p className="text-gray-600 text-sm mt-1">Great work today.</p>
    </div>
  );
}

function ReflectionInput({ value, onChange }) {
  return (
    <div>
      <label className="block text-gray-500 text-xs uppercase tracking-wider mb-3">
        Daily Reflection
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder="How did today go?"
        rows={3}
        className="w-full px-4 py-3 rounded-lg text-sm focus:ring-0 focus:border-gray-600"
      />
    </div>
  );
}

function Onboarding({ onStart }) {
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleSave = (rules) => {
    onStart(rules, startDate);
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Explanation */}
      <div className="border border-gray-800 rounded-lg p-4 space-y-4">
        <h2 className="text-white font-medium">Welcome to 75 Smart</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          A 75-day mental discipline challenge. Define 3-8 daily rules and complete
          them every day. Miss one day and you get a warning. Miss two consecutive
          days and you reset to Day 0.
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="text-green-500">✓</span> 75 days
          </span>
          <span className="flex items-center gap-1">
            <span className="text-amber-500">!</span> 1 day grace
          </span>
          <span className="flex items-center gap-1">
            <span className="text-red-500">×</span> 2 days = reset
          </span>
        </div>
      </div>

      {/* Start Date */}
      <div>
        <label className="block text-gray-500 text-xs uppercase tracking-wider mb-3">
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-4 py-3 rounded-lg text-sm bg-gray-900 border border-gray-800 text-white focus:ring-0 focus:border-gray-600 [color-scheme:dark]"
        />
        <p className="text-gray-600 text-xs mt-2">
          When do you want to start your 75-day journey?
        </p>
      </div>

      {/* Rules Editor */}
      <div>
        <label className="block text-gray-500 text-xs uppercase tracking-wider mb-3">
          Your Rules
        </label>
        <RulesEditor
          initialRules={DEFAULT_RULES}
          onSave={handleSave}
          saveButtonText="Start Challenge"
        />
      </div>
    </div>
  );
}

export default TasksTab;
