import { useState } from "react";

// Shared rules editor component used in onboarding and settings
export function RulesEditor({ 
  initialRules, 
  onSave, 
  saveButtonText = "Save",
  showResetToggle = false,
  onCancel = null 
}) {
  const [rules, setRules] = useState(initialRules);
  const [resetProgress, setResetProgress] = useState(false);

  const validateRules = () => {
    if (rules.length < 3) {
      alert("Please add at least 3 rules");
      return false;
    }
    if (rules.some(r => !r.text.trim())) {
      alert("Please fill in all rules or remove empty ones");
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateRules()) return;
    onSave(rules, resetProgress);
  };

  const addRule = () => {
    if (rules.length >= 8) return;
    setRules([...rules, { id: Date.now(), text: "" }]);
  };

  const removeRule = (index) => {
    if (rules.length <= 3) return;
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index, text) => {
    setRules(rules.map((rule, i) => 
      i === index ? { ...rule, text } : rule
    ));
  };

  return (
    <div className="space-y-4">
      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule, index) => (
          <div key={rule.id} className="flex items-center gap-3">
            <span className="text-gray-600 text-xs w-6">
              {String(index + 1).padStart(2, "0")}
            </span>
            <input
              type="text"
              value={rule.text}
              onChange={(e) => updateRule(index, e.target.value)}
              placeholder="Enter rule..."
              className="flex-1 px-4 py-3 rounded-lg text-sm bg-gray-900 border border-gray-800 text-white focus:ring-0 focus:border-gray-600"
            />
            {rules.length > 3 && (
              <button
                onClick={() => removeRule(index)}
                className="text-gray-600 hover:text-gray-400 px-2 text-lg"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Rule Button */}
      {rules.length < 8 && (
        <button
          onClick={addRule}
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          + Add another rule
        </button>
      )}

      {/* Reset Toggle (optional) */}
      {showResetToggle && (
        <div className="pt-4 border-t border-gray-800">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={resetProgress}
              onChange={(e) => setResetProgress(e.target.checked)}
              className="w-5 h-5 rounded border-gray-600 bg-gray-900 text-amber-500 focus:ring-amber-500"
            />
            <div>
              <span className="text-gray-300 text-sm">Reset progress when saving</span>
              <p className="text-gray-600 text-xs mt-0.5">
                {resetProgress ? "Challenge will restart from Day 1" : "Keep your current progress"}
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Action Buttons */}
      <div className={`flex gap-3 ${showResetToggle ? "pt-4 border-t border-gray-800" : "pt-4"}`}>
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-700 text-gray-400 rounded-lg hover:border-gray-600 hover:text-gray-300 transition-all"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          className="flex-1 py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          {saveButtonText}
        </button>
      </div>
    </div>
  );
}
