import { useState } from "react";
import {
  updateStartDate,
  updateRulesWithoutReset,
  updateRules,
  resetChallenge,
  clearAllData,
  calculateCurrentDay,
} from "../utils/storage";
import { ConfirmModal, ModalOverlay, ModalContainer } from "./ui/Modal";
import { RulesEditor } from "./ui/RulesEditor";

function SettingsTab({ data, setData }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDateConfirm, setShowDateConfirm] = useState(false);
  const [pendingDate, setPendingDate] = useState(null);
  const [showEditRules, setShowEditRules] = useState(false);

  const currentDay = calculateCurrentDay(data.challenge.startDate);

  const handleDateChange = (e) => {
    setPendingDate(e.target.value);
    setShowDateConfirm(true);
  };

  const confirmDateChange = () => {
    setData(updateStartDate(data, pendingDate));
    setShowDateConfirm(false);
    setPendingDate(null);
  };

  const handleResetChallenge = () => {
    setData(resetChallenge(data));
    setShowResetConfirm(false);
  };

  const handleClearAllData = () => {
    clearAllData();
    setData(null);
    setShowClearConfirm(false);
  };

  const handleSaveRules = (newRules, shouldReset) => {
    const newData = shouldReset
      ? updateRules(data, newRules)
      : updateRulesWithoutReset(data, newRules);
    setData(newData);
    setShowEditRules(false);
  };

  return (
    <div className="space-y-6">
      {/* Change Start Date */}
      <SettingsCard title="Change Start Date">
        <p className="text-gray-400 text-sm mb-4">
          Adjust when your 75-day challenge began. This will recalculate your current day without losing your daily logs.
        </p>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={data.challenge.startDate}
            onChange={handleDateChange}
            className="flex-1 px-4 py-3 rounded-lg text-sm bg-gray-900 border border-gray-800 text-white focus:ring-0 focus:border-gray-600 [color-scheme:dark]"
          />
          <div className="text-right">
            <p className="text-white text-lg font-medium">Day {Math.min(currentDay, 75)}</p>
            <p className="text-gray-600 text-xs">of 75</p>
          </div>
        </div>
      </SettingsCard>

      {/* Edit Rules */}
      <SettingsCard title="Edit Rules">
        <p className="text-gray-400 text-sm mb-4">
          Modify your daily rules. You can choose to keep your progress or reset the challenge.
        </p>
        <button
          onClick={() => setShowEditRules(true)}
          className="w-full py-3 border border-gray-700 text-gray-300 rounded-lg hover:border-gray-600 hover:text-white transition-all"
        >
          Edit Rules
        </button>
      </SettingsCard>

      {/* Reset Challenge */}
      <SettingsCard title="Reset Challenge">
        <p className="text-gray-400 text-sm mb-4">
          Start fresh from Day 1. Your history will be preserved but your streak will reset.
        </p>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-3 border border-amber-800 text-amber-500 rounded-lg hover:border-amber-700 hover:bg-amber-950/30 transition-all"
        >
          Reset to Day 1
        </button>
      </SettingsCard>

      {/* Danger Zone */}
      <SettingsCard title="Danger Zone" variant="danger">
        <p className="text-gray-400 text-sm mb-4">
          Permanently delete all your data and start completely over. This cannot be undone.
        </p>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="w-full py-3 border border-red-800 text-red-500 rounded-lg hover:border-red-700 hover:bg-red-950/30 transition-all"
        >
          Clear All Data
        </button>
      </SettingsCard>

      {/* Modals */}
      {showDateConfirm && (
        <ConfirmModal
          title="Change Start Date?"
          message={`This will recalculate your current day based on the new start date (${pendingDate}). Your daily logs will be preserved.`}
          confirmText="Change Date"
          onConfirm={confirmDateChange}
          onCancel={() => {
            setShowDateConfirm(false);
            setPendingDate(null);
          }}
        />
      )}

      {showResetConfirm && (
        <ConfirmModal
          title="Reset Challenge?"
          message="This will restart your challenge from Day 1. Your total resets count will increase by 1. Your history will be preserved."
          confirmText="Reset Challenge"
          confirmStyle="amber"
          onConfirm={handleResetChallenge}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      {showClearConfirm && (
        <ConfirmModal
          title="Clear All Data?"
          message="This will permanently delete ALL your data including rules, logs, and statistics. You will return to the onboarding screen. This action cannot be undone."
          confirmText="Delete Everything"
          confirmStyle="red"
          onConfirm={handleClearAllData}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}

      {showEditRules && (
        <EditRulesModal
          rules={data.rules}
          onSave={handleSaveRules}
          onClose={() => setShowEditRules(false)}
        />
      )}
    </div>
  );
}

function SettingsCard({ title, variant = "default", children }) {
  const borderClass = variant === "danger" ? "border-red-900/50" : "border-gray-800";
  const titleClass = variant === "danger" ? "text-red-500" : "text-gray-500";
  
  return (
    <div className={`border ${borderClass} rounded-lg p-4`}>
      <h3 className={`text-xs ${titleClass} uppercase tracking-wider mb-4`}>{title}</h3>
      {children}
    </div>
  );
}

function EditRulesModal({ rules, onSave, onClose }) {
  return (
    <ModalOverlay>
      <ModalContainer maxWidth="max-w-lg">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-lg font-medium text-white">Edit Rules</h2>
          <p className="text-sm text-gray-500 mt-1">Modify your daily rules (3-8 rules)</p>
        </div>
        <div className="p-6">
          <RulesEditor
            initialRules={rules}
            onSave={onSave}
            saveButtonText="Save Changes"
            showResetToggle={true}
            onCancel={onClose}
          />
        </div>
      </ModalContainer>
    </ModalOverlay>
  );
}

export default SettingsTab;
