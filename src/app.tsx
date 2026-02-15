import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AppShell from "./layouts/AppShell";
import SignInPage from "./pages/Auth/SignInPage";
import SignUpPage from "./pages/Auth/SignUpPage";

type AuthMode = "sign-in" | "sign-up";
type ThemeMode = "light" | "dark";

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = localStorage.getItem("opus.theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const AuthGate = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<AuthMode>("sign-in");

  if (user) {
    return <AppShell />;
  }

  if (mode === "sign-up") {
    return <SignUpPage onSwitchMode={() => setMode("sign-in")} />;
  }

  return <SignInPage onSwitchMode={() => setMode("sign-up")} />;
};

const App = () => {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", getInitialTheme());
  }, []);

  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
};

export default App;
