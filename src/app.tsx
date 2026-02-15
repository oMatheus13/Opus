import { useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AppShell from "./layouts/AppShell";
import SignInPage from "./pages/Auth/SignInPage";
import SignUpPage from "./pages/Auth/SignUpPage";

type AuthMode = "sign-in" | "sign-up";

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
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
};

export default App;
