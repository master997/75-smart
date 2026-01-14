import { useState } from 'react'

function EditRulesModal({ rules, onSave, onClose }) {
  const [editedRules, setEditedRules] = useState(rules)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSave = () => {
    if (editedRules.length < 3) {
      alert('Please keep at least 3 rules')
      return
    }
    const emptyRules = editedRules.filter(r => !r.text.trim())
    if (emptyRules.length > 0) {
      alert('Please fill in all rules or remove empty ones')
      return
    }
    setShowConfirm(true)
  }

  const confirmSave = () => {
    onSave(editedRules)
    onClose()
  }

  const addRule = () => {
    if (editedRules.length >= 8) return
    setEditedRules([...editedRules, { id: Date.now(), text: '' }])
  }

  const removeRule = (index) => {
    if (editedRules.length <= 3) return
    setEditedRules(editedRules.filter((_, i) => i !== index))
  }

  const updateRule = (index, text) => {
    const newRules = [...editedRules]
    newRules[index] = { ...newRules[index], text }
    setEditedRules(newRules)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-950 border border-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {!showConfirm ? (
          <>
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-lg font-medium text-white">Edit Rules</h2>
              <p className="text-sm text-gray-500 mt-1">
                Modify your daily rules (3-8 rules)
              </p>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                {editedRules.map((rule, index) => (
                  <div key={rule.id} className="flex items-center gap-3">
                    <span className="text-gray-600 text-xs w-6">{String(index + 1).padStart(2, '0')}</span>
                    <input
                      type="text"
                      value={rule.text}
                      onChange={(e) => updateRule(index, e.target.value)}
                      placeholder="Enter rule..."
                      className="flex-1 px-4 py-3 rounded-lg text-sm"
                    />
                    {editedRules.length > 3 && (
                      <button
                        onClick={() => removeRule(index)}
                        className="text-gray-600 hover:text-gray-400 px-2 py-1 text-lg"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {editedRules.length < 8 && (
                <button
                  onClick={addRule}
                  className="mt-4 text-gray-500 hover:text-gray-300 text-sm transition-colors"
                >
                  + Add another rule
                </button>
              )}
            </div>

            <div className="p-6 border-t border-gray-800 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-gray-700 text-gray-400 rounded-lg hover:border-gray-600 hover:text-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Reset Challenge?
            </h3>
            <p className="text-gray-500 mb-8">
              Changing your rules will reset your challenge to <span className="text-white">Day 0</span>.
              Your history will be preserved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border border-gray-700 text-gray-400 rounded-lg hover:border-gray-600 hover:text-gray-300 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={confirmSave}
                className="flex-1 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Reset & Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditRulesModal
