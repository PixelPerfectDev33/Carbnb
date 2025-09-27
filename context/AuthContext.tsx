import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

type AuthContextType = {
  user: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: "google" | "github" | "facebook" | "apple") => Promise<any>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  signInWithProvider: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = async (email: string, password: string) =>
    supabase.auth.signUp({ email, password });

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const signInWithProvider = async (provider: "google" | "github" | "facebook" | "apple") =>
    supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: "exp://localhost:19000" }, // update for production
    });

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithProvider }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
