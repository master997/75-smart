import { useState, useEffect } from "react";
import {
  loadData,
  saveData,
  initializeData,
  isStorageAvailable,
  calculateCurrentDay,
  checkForReset,
  resetChallenge,
  getTodayKey,
} from "./utils/storage";
import TasksTab from "./components/TasksTab";
import CalendarTab from "./components/CalendarTab";
import StatsTab from "./components/StatsTab";
import SettingsTab from "./components/SettingsTab";
import ResetModal from "./components/ResetModal";
import VictoryModal from "./components/VictoryModal";

const TABS = [
  { id: "tasks", label: "Tasks" },
  { id: "calendar", label: "Calendar" },
  { id: "stats", label: "Stats" },
  { id: "settings", label: "Settings" },
];

function App() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [data, setData] = useState(null);
  const [storageError, setStorageError] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [missedDays, setMissedDays] = useState(0);

  useEffect(() => {
    if (!isStorageAvailable()) {
      setStorageError(true);
      return;
    }

    const stored = loadData();
    if (!stored) return;

    // Check for 2-day reset condition
    const resetCheck = checkForReset(stored);
    if (resetCheck.needsReset) {
      setMissedDays(resetCheck.missedDays);
      setShowResetModal(true);
    }

    // Check for victory (day 75 completed)
    const day = calculateCurrentDay(stored.challenge.startDate);
    if (day >= 75 && !stored.victoryShown) {
      setShowVictoryModal(true);
    }

    setData(stored);
  }, []);

  const handleStartChallenge = (rules, startDate) => {
    setData(initializeData(rules, startDate));
  };

  const handleResetAcknowledge = () => {
    setData(resetChallenge(data));
    setShowResetModal(false);
  };

  const handleVictoryClose = () => {
    const newData = { ...data, victoryShown: true };
    saveData(newData);
    setData(newData);
    setShowVictoryModal(false);
  };

  if (storageError) {
    return <StorageError />;
  }

  const currentDay = data?.challenge?.startDate
    ? calculateCurrentDay(data.challenge.startDate)
    : 0;

  const progressPercent = calculateProgress(data);

  return (
    <div className="min-h-screen bg-black">
      <Header data={data} currentDay={currentDay} progressPercent={progressPercent} />

      {data && (
        <TabNavigation 
          tabs={TABS} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      )}

      <main className="max-w-lg mx-auto px-4 py-8">
        {!data ? (
          <TasksTab data={data} setData={setData} onStartChallenge={handleStartChallenge} />
        ) : (
          <TabContent activeTab={activeTab} data={data} setData={setData} />
        )}
      </main>

      {showResetModal && (
        <ResetModal missedDays={missedDays} onAcknowledge={handleResetAcknowledge} />
      )}

      {showVictoryModal && (
        <VictoryModal data={data} onClose={handleVictoryClose} />
      )}
    </div>
  );
}

// Helper function
function calculateProgress(data) {
  if (!data) return 0;
  const todayKey = getTodayKey();
  const todayLog = data.dailyLogs?.[todayKey] || { completed: [] };
  const totalRules = data.rules?.length || 0;
  const completedToday = todayLog.completed?.length || 0;
  return totalRules > 0 ? Math.round((completedToday / totalRules) * 100) : 0;
}

// Sub-components
function StorageError() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-xl font-medium text-red-500 mb-2">Storage Error</h1>
        <p className="text-gray-500">
          This app requires localStorage. Please use regular browsing mode.
        </p>
      </div>
    </div>
  );
}

function Header({ data, currentDay, progressPercent }) {
  return (
    <header className="pt-16 pb-8 px-4">
      <div className="max-w-lg mx-auto text-center">
        {/* Logo */}
        <div className="relative">
          <h1 className="text-[180px] md:text-[220px] font-bold leading-none tracking-tighter text-white">
            75
          </h1>
          <p className="text-2xl md:text-3xl font-medium tracking-wide text-white -mt-4">
            Smart
          </p>
        </div>

        {/* Progress */}
        {data && (
          <>
            <div className="mt-12">
              <p className="text-gray-500 text-sm tracking-widest uppercase mb-4">
                Progress Vector {progressPercent}%
              </p>
              <div className="relative h-[2px] bg-gray-800 w-full max-w-xs mx-auto">
                <div
                  className="absolute left-0 top-0 h-full bg-white transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-gray-500">
              <div>
                <span className="text-white text-2xl font-medium">{Math.min(currentDay, 75)}</span>
                <span className="text-sm ml-1">/ 75 days</span>
              </div>
              <div className="w-px h-6 bg-gray-800" />
              <div>
                <span className="text-white text-2xl font-medium">{data.challenge.currentStreak}</span>
                <span className="text-sm ml-1">streak</span>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function TabNavigation({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="border-t border-gray-900">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-center gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 text-sm tracking-wide transition-all ${
                activeTab === tab.id ? "text-white" : "text-gray-600 hover:text-gray-400"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && <div className="h-px bg-white mt-2" />}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function TabContent({ activeTab, data, setData }) {
  switch (activeTab) {
    case "tasks":
      return <TasksTab data={data} setData={setData} />;
    case "calendar":
      return <CalendarTab data={data} />;
    case "stats":
      return <StatsTab data={data} />;
    case "settings":
      return <SettingsTab data={data} setData={setData} />;
    default:
      return null;
  }
}

export default App;
