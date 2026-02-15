import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type { AuthError, AuthResponse, Session, User } from "@supabase/supabase-js";
import { authService } from "../services/authService";

const DEV_SESSION_KEY = "opus.dev.session";

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<AuthResponse>;
  signUp: (credentials: SignInCredentials) => Promise<AuthResponse>;
  signInDev: () => void;
  signOut: () => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [devUser, setDevUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isDev = import.meta.env.DEV;

  const buildDevUser = (): User => {
    const now = new Date().toISOString();

    return {
      id: "dev-user",
      aud: "authenticated",
      role: "authenticated",
      email: "dev@opus.local",
      app_metadata: { provider: "dev" },
      user_metadata: { role: "dev" },
      created_at: now,
      updated_at: now
    };
  };

  useEffect(() => {
    let mounted = true;

    authService.getSession().then(({ data, error }) => {
      if (!mounted) {
        return;
      }

      if (error) {
        setSession(null);
      } else {
        setSession(data.session);
      }

      setLoading(false);
    });

    const { data } = authService.onAuthStateChange((_event, nextSession) => {
      if (!mounted) {
        return;
      }

      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isDev) {
      return;
    }

    if (localStorage.getItem(DEV_SESSION_KEY) === "1") {
      setDevUser(buildDevUser());
    }
  }, [isDev]);

  const signInDev = () => {
    if (!isDev) {
      return;
    }

    localStorage.setItem(DEV_SESSION_KEY, "1");
    setDevUser(buildDevUser());
  };

  const signOut = async () => {
    if (isDev) {
      localStorage.removeItem(DEV_SESSION_KEY);
      setDevUser(null);
    }

    if (isDev && devUser && !session) {
      return { error: null };
    }

    return authService.signOut();
  };

  const value = useMemo<AuthContextValue>(() => {
    return {
      session,
      user: session?.user ?? devUser ?? null,
      loading,
      signIn: authService.signIn,
      signUp: authService.signUp,
      signInDev,
      signOut
    };
  }, [session, devUser, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
