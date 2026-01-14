function VictoryModal({ data, onClose, onStartNew }) {
  const completions = (data.challenge.totalCompletions || 0) + 1;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-950 border border-gray-800 rounded-xl max-w-md w-full p-8 text-center">
        {/* Celebration Icon */}
        <div className="text-6xl mb-4">🎉</div>

        <h2 className="text-3xl font-bold text-white mb-2">
          You Did It!
        </h2>

        <p className="text-gray-400 mb-8">
          You completed the 75-day challenge!
        </p>

        {/* Lifetime Completions - Highlighted */}
        <div className="bg-white/5 border border-white/20 rounded-xl p-6 mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">75 Smarts Completed</p>
          <p className="text-5xl font-bold text-white">{completions}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border border-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wider">Longest Streak</p>
            <p className="text-2xl font-medium text-white mt-1">
              {Math.max(data.challenge.longestStreak || 0, data.challenge.currentStreak || 0)}
              <span className="text-sm text-gray-600 ml-1">days</span>
            </p>
          </div>
          <div className="border border-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-600 uppercase tracking-wider">Total Resets</p>
            <p className="text-2xl font-medium text-white mt-1">
              {data.challenge.totalResets || 0}
              <span className="text-sm text-gray-600 ml-1">times</span>
            </p>
          </div>
        </div>

        {/* Prompt */}
        <p className="text-white text-lg mb-6">
          Ready for another 75?
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onStartNew}
            className="w-full py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Start New Challenge
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-gray-400 hover:text-white transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default VictoryModal;
