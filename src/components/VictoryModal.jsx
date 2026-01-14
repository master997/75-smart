function VictoryModal({ data, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">🏆</div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Congratulations!
        </h2>

        <p className="text-lg text-indigo-600 font-medium mb-4">
          You completed the 75-day challenge!
        </p>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Longest Streak</p>
              <p className="text-xl font-bold text-indigo-600">
                {data.challenge.longestStreak} days
              </p>
            </div>
            <div>
              <p className="text-gray-500">Total Resets</p>
              <p className="text-xl font-bold text-amber-600">
                {data.challenge.totalResets}
              </p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          You've built powerful habits over these 75 days.
          Keep the momentum going!
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
        >
          Continue Tracking
        </button>
      </div>
    </div>
  )
}

export default VictoryModal
