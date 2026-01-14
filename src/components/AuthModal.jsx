import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ModalOverlay, ModalContainer } from "./ui/Modal";
import { loadData, migrateToCloud } from "../utils/storage";

export function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("signin"); // signin | signup | confirm
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { signIn, signUp, error: authError, clearError } = useAuth();

  const error = localError || authError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (!error) {
          onSuccess?.();
          onClose();
        }
      } else {
        const { error, data } = await signUp(email, password);
        if (!error) {
          // Check if email confirmation is required
          if (data?.user?.identities?.length === 0) {
            setMode("confirm");
          } else {
            // Auto-migrate local data if exists
            const localData = loadData();
            if (localData && data?.user?.id) {
              await migrateToCloud(data.user.id);
            }
            onSuccess?.();
            onClose();
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setLocalError(null);
    clearError();
  };

  if (mode === "confirm") {
    return (
      <ModalOverlay>
        <ModalContainer>
          <div className="p-6 text-center">
            <div className="w-16 h-16 border border-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl text-green-400">✓</span>
            </div>
            <h2 className="text-lg font-medium text-white mb-2">Check your email</h2>
            <p className="text-gray-400 text-sm mb-6">
              We sent a confirmation link to <span className="text-white">{email}</span>.
              Click the link to activate your account.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Got it
            </button>
          </div>
        </ModalContainer>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay>
      <ModalContainer>
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-medium text-white">
                {mode === "signin" ? "Sign In" : "Create Account"}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {mode === "signin"
                  ? "Access your progress from any device"
                  : "Sync your progress across devices"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-400 text-xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-500 text-xs uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-lg text-sm bg-gray-900 border border-gray-800 text-white focus:ring-0 focus:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-gray-500 text-xs uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg text-sm bg-gray-900 border border-gray-800 text-white focus:ring-0 focus:border-gray-600"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-950/30 border border-red-800 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              {mode === "signin"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>

          {mode === "signup" && (
            <p className="mt-4 text-gray-600 text-xs text-center">
              Your local progress will be synced to the cloud when you sign up.
            </p>
          )}
        </div>
      </ModalContainer>
    </ModalOverlay>
  );
}

export default AuthModal;
