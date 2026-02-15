import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import opusLogo from "../../assets/brand/opus-logotipo.svg";

type SignInPageProps = {
  onSwitchMode: () => void;
};

const SignInPage = ({ onSwitchMode }: SignInPageProps) => {
  const { signIn, signInDev } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDev = import.meta.env.DEV;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage("Informe seu email.");
      return;
    }

    if (!password) {
      setErrorMessage("Informe sua senha.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn({
      email: trimmedEmail,
      password
    });

    if (error) {
      setErrorMessage(error.message);
    }

    setIsSubmitting(false);
  };

  const handleDevLogin = () => {
    setErrorMessage(null);
    signInDev();
  };

  const handleForgotPassword = () => {
    setErrorMessage("Recuperacao de senha em breve.");
  };

  return (
    <main className="auth">
      <header className="auth__topbar">
        <img className="auth__logo" src={opusLogo} alt="Opus" />
      </header>

      <section className="auth__content">
        <form className="auth__form" onSubmit={handleSubmit}>
          <input
            id="signin-email"
            className="auth__input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <div className="auth__field">
            <input
              id="signin-password"
              className="auth__input auth__input--with-toggle"
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              className="auth__toggle"
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPassword}
            >
              <i
                className={`fi fi-sr-${showPassword ? "eye" : "eye-crossed"}`}
                aria-hidden="true"
              />
            </button>
          </div>

          <button className="auth__forgot" type="button" onClick={handleForgotPassword}>
            Esqueceu a senha?
          </button>

          <label className="toggle auth__remember" htmlFor="login-remember">
            <input
              id="login-remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span className="toggle__track" aria-hidden="true">
              <span className="toggle__thumb" />
            </span>
            <span className="toggle__label">Manter conectado</span>
          </label>

          {errorMessage ? (
            <p className="auth__status" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <div className="auth__actions">
            <div className="auth__actions-row">
              <button
                className="button button--primary auth__primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
              </button>
              {isDev ? (
                <button
                  className="button button--ghost auth__dev"
                  type="button"
                  onClick={handleDevLogin}
                  disabled={isSubmitting}
                  title="Login de desenvolvimento"
                  aria-label="Login de desenvolvimento"
                >
                  <span className="material-symbols-rounded" aria-hidden="true">
                    terminal
                  </span>
                </button>
              ) : null}
            </div>
          </div>
        </form>

        <p className="auth__switch">
          Nao tem uma conta?{" "}
          <button className="button button--link" type="button" onClick={onSwitchMode}>
            Criar conta
          </button>
        </p>
      </section>
    </main>
  );
};

export default SignInPage;
