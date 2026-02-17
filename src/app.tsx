import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AppShell from "./layouts/AppShell";
import SignInPage from "./pages/Auth/SignInPage";
import SignUpPage from "./pages/Auth/SignUpPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import WelcomePage from "./pages/Onboarding/WelcomePage";
import SetupPage from "./pages/Onboarding/SetupPage";
import { applyTheme, getInitialTheme } from "./utils/theme";
import { applySkin, getInitialSkin } from "./utils/skin";
import {
  PRE_ONBOARDING_COMPLETED_KEY,
  savePreOnboarding
} from "./utils/onboarding";

type AuthMode = "sign-in" | "sign-up";
const DEV_SETUP_KEY = "opus.dev.setup.completed";

const AuthGate = () => {
  const { user, loading, recoveryMode, clearRecovery } = useAuth();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const isDev = import.meta.env.DEV;
  const [preOnboardingComplete, setPreOnboardingComplete] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }
    return localStorage.getItem(PRE_ONBOARDING_COMPLETED_KEY) === "1";
  });

  if (loading) {
    return null;
  }

  if (recoveryMode) {
    return (
      <ResetPasswordPage
        onComplete={() => {
          clearRecovery();
          setMode("sign-in");
        }}
      />
    );
  }

  if (!preOnboardingComplete && !user) {
    return (
      <WelcomePage
        onComplete={(data) => {
          savePreOnboarding(data);
          if (data.theme) {
            applyTheme(data.theme);
          }
          setPreOnboardingComplete(true);
        }}
      />
    );
  }

  if (user) {
    const metadata = user.user_metadata as Record<string, unknown> | undefined;
    const isSetupComplete = Boolean(
      metadata?.setup_completed || (isDev && localStorage.getItem(DEV_SETUP_KEY) === "1")
    );

    if (!isSetupComplete) {
      return (
        <SetupPage
          onComplete={() => {
            if (isDev) {
              localStorage.setItem(DEV_SETUP_KEY, "1");
            }
          }}
        />
      );
    }

    return <AppShell />;
  }

  if (mode === "sign-up") {
    return <SignUpPage onSwitchMode={() => setMode("sign-in")} />;
  }

  return <SignInPage onSwitchMode={() => setMode("sign-up")} />;
};

const App = () => {
  useEffect(() => {
    applyTheme(getInitialTheme());
    applySkin(getInitialSkin());
  }, []);

  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
};

export default App;
