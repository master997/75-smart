import { useState } from 'react'
import { format } from 'date-fns'

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {!showConfirm ? (
          <>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Edit Rules</h2>
              <p className="text-sm text-gray-500 mt-1">
                Modify your daily rules (3-8 rules)
              </p>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                {editedRules.map((rule, index) => (
                  <div key={rule.id} className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm w-6">{index + 1}.</span>
                    <input
                      type="text"
                      value={rule.text}
                      onChange={(e) => updateRule(index, e.target.value)}
                      placeholder="Enter rule..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {editedRules.length > 3 && (
                      <button
                        onClick={() => removeRule(index)}
                        className="text-red-500 hover:text-red-700 px-2 py-1"
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
                  className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  + Add another rule
                </button>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reset Challenge?
            </h3>
            <p className="text-gray-600 mb-6">
              Changing your rules will reset your challenge to <strong>Day 0</strong>.
              Your history will be preserved, but you'll start fresh.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Go Back
              </button>
              <button
                onClick={confirmSave}
                className="flex-1 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
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
