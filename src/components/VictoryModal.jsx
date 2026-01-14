function VictoryModal({ data, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-950 border border-gray-800 rounded-xl max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-6">◆</div>

        <h2 className="text-2xl font-medium text-white mb-2">
          Congratulations
        </h2>

        <p className="text-gray-400 mb-8">
          You completed the 75-day challenge.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border border-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wider">Longest Streak</p>
            <p className="text-2xl font-medium text-white mt-1">
              {data.challenge.longestStreak}
              <span className="text-sm text-gray-600 ml-1">days</span>
            </p>
          </div>
          <div className="border border-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wider">Total Resets</p>
            <p className="text-2xl font-medium text-white mt-1">
              {data.challenge.totalResets}
              <span className="text-sm text-gray-600 ml-1">times</span>
            </p>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-8">
          You've built powerful habits over these 75 days.
        </p>

        <button
          onClick={onClose}
          className="w-full py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
        >
          Continue Tracking
        </button>
      </div>
    </div>
  )
}

export default VictoryModal
