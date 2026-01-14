function ResetModal({ missedDays, onAcknowledge }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">💪</span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Challenge Reset
        </h2>

        <p className="text-gray-600 mb-4">
          You missed {missedDays} consecutive days. Your challenge has been reset to Day 0.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-800 text-sm">
            <strong>Remember:</strong> Missing one day is okay. Missing two consecutive days triggers a reset.
            This keeps you accountable while allowing flexibility.
          </p>
        </div>

        <p className="text-gray-500 text-sm mb-6">
          Your previous progress has been saved. Time to start fresh!
        </p>

        <button
          onClick={onAcknowledge}
          className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
        >
          Start Fresh
        </button>
      </div>
    </div>
  )
}

export default ResetModal
