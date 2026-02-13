import { useState } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import SignInPage from "./pages/Auth/SignInPage";
import SignUpPage from "./pages/Auth/SignUpPage";

type AuthMode = "sign-in" | "sign-up";

const AuthGate = () => {
  const { user, signOut } = useAuth();
  const [mode, setMode] = useState<AuthMode>("sign-in");

  if (user) {
    return (
      <main className="auth-shell">
        <section className="auth-card auth-status">
          <header className="auth-header">
            <p className="auth-eyebrow">Opus</p>
            <h1 className="auth-title">Sessao ativa</h1>
            <p className="auth-subtitle">Logado como {user.email}</p>
          </header>
          <div className="auth-actions">
            <button className="auth-button" type="button" onClick={signOut}>
              Sair
            </button>
          </div>
        </section>
      </main>
    );
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
