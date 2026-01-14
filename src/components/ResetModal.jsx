function ResetModal({ missedDays, onAcknowledge }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-950 border border-gray-800 rounded-xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">↻</span>
        </div>

        <h2 className="text-xl font-medium text-white mb-2">
          Challenge Reset
        </h2>

        <p className="text-gray-500 mb-6">
          You missed {missedDays} consecutive days. Your challenge has been reset to Day 0.
        </p>

        <div className="border-l-2 border-gray-700 pl-4 py-2 text-left mb-8">
          <p className="text-gray-400 text-sm">
            <span className="text-white">Remember:</span> Missing one day is okay. Missing two consecutive days triggers a reset. This keeps you accountable while allowing flexibility.
          </p>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Your previous progress has been saved.
        </p>

        <button
          onClick={onAcknowledge}
          className="w-full py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          Start Fresh
        </button>
      </div>
    </div>
  )
}

export default ResetModal
