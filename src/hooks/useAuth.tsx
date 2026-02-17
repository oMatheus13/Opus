import type { ReactNode } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import type {
  AuthError,
  AuthOtpResponse,
  AuthResponse,
  Session,
  User,
  UserAttributes,
  UserResponse
} from "@supabase/supabase-js";
import { authService } from "../services/authService";

const DEV_SESSION_KEY = "opus.dev.session";
const DEV_METADATA_KEY = "opus.dev.user_metadata";

type SignInCredentials = {
  email: string;
  password: string;
};

type SignUpMetadata = {
  name?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
};

type SignUpCredentials = SignInCredentials & {
  data?: SignUpMetadata;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  recoveryMode: boolean;
  signIn: (credentials: SignInCredentials) => Promise<AuthResponse>;
  signInWithOtp: (email: string, redirectTo?: string) => Promise<AuthOtpResponse>;
  signUp: (credentials: SignUpCredentials) => Promise<AuthResponse>;
  signInDev: () => void;
  updateUser: (attributes: UserAttributes) => Promise<UserResponse>;
  resetPassword: (email: string, redirectTo?: string) => Promise<AuthResponse>;
  resendVerification: (email: string) => Promise<AuthOtpResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  clearRecovery: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [devUser, setDevUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.location.hash.includes("type=recovery");
  });
  const isDev = import.meta.env.DEV;

  const buildDevUser = (): User => {
    const now = new Date().toISOString();
    let storedMetadata: Record<string, unknown> = {};

    try {
      const raw = localStorage.getItem(DEV_METADATA_KEY);
      storedMetadata = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    } catch {
      storedMetadata = {};
    }

    return {
      id: "dev-user",
      aud: "authenticated",
      role: "authenticated",
      email: "dev@opus.local",
      email_confirmed_at: now,
      confirmed_at: now,
      app_metadata: { provider: "dev" },
      user_metadata: { role: "dev", ...storedMetadata },
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

    const { data } = authService.onAuthStateChange((event, nextSession) => {
      if (!mounted) {
        return;
      }

      setSession(nextSession);
      setLoading(false);

      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
      }

      if (event === "SIGNED_OUT") {
        setRecoveryMode(false);
      }
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

  const updateUser = async (attributes: UserAttributes): Promise<UserResponse> => {
    if (isDev && devUser && !session) {
      const nextMetadata = {
        ...(devUser.user_metadata as Record<string, unknown> | undefined),
        ...(attributes.data as Record<string, unknown> | undefined)
      };
      const updatedUser: User = {
        ...devUser,
        user_metadata: nextMetadata,
        updated_at: new Date().toISOString()
      };

      setDevUser(updatedUser);
      localStorage.setItem(DEV_METADATA_KEY, JSON.stringify(nextMetadata));

      return { data: { user: updatedUser }, error: null };
    }

    return authService.updateUser(attributes);
  };

  const clearRecovery = () => {
    setRecoveryMode(false);
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
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
      recoveryMode,
      signIn: authService.signIn,
      signInWithOtp: authService.signInWithOtp,
      signUp: authService.signUp,
      signInDev,
      updateUser,
      resetPassword: authService.resetPassword,
      resendVerification: authService.resendVerification,
      signOut,
      clearRecovery
    };
  }, [session, devUser, loading, recoveryMode]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
