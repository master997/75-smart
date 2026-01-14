// Shared modal components

export function ModalOverlay({ children }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      {children}
    </div>
  );
}

export function ModalContainer({ children, maxWidth = "max-w-md" }) {
  return (
    <div className={`bg-gray-950 border border-gray-800 rounded-xl ${maxWidth} w-full`}>
      {children}
    </div>
  );
}

export function ConfirmModal({ 
  title, 
  message, 
  confirmText, 
  confirmStyle = "white", 
  onConfirm, 
  onCancel 
}) {
  const confirmStyles = {
    white: "bg-white text-black hover:bg-gray-100",
    amber: "bg-amber-600 text-white hover:bg-amber-700",
    red: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <div className="p-6">
          <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 border border-gray-700 text-gray-400 rounded-lg hover:border-gray-600 hover:text-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 font-medium rounded-lg transition-colors ${confirmStyles[confirmStyle]}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </ModalContainer>
    </ModalOverlay>
  );
}
