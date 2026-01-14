import { createContext, useContext, useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../utils/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isGuest = !user;
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  const signUp = async (email, password) => {
    if (!supabase) return { error: { message: "Supabase not configured" } };
    
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      setError(error.message);
      return { error };
    }
    
    return { data };
  };

  const signIn = async (email, password) => {
    if (!supabase) return { error: { message: "Supabase not configured" } };
    
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
      return { error };
    }
    
    return { data };
  };

  const signOut = async () => {
    if (!supabase) return;
    
    setError(null);
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    isGuest,
    isConfigured,
    signUp,
    signIn,
    signOut,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
