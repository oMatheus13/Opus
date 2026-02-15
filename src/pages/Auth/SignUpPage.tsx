import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import opusLogo from "../../assets/brand/opus-logotipo.svg";

type SignUpPageProps = {
  onSwitchMode: () => void;
};

  const SignUpPage = ({ onSwitchMode }: SignUpPageProps) => {
    const { signUp } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage("Informe seu email.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("As senhas nao conferem.");
      return;
    }

    setIsSubmitting(true);

    const { error } = await signUp({
      email: trimmedEmail,
      password
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage("Conta criada. Verifique seu email para confirmar.");
    }

    setIsSubmitting(false);
  };

  return (
    <main className="auth">
      <header className="auth__topbar">
        <img className="auth__logo" src={opusLogo} alt="Opus" />
      </header>

      <section className="auth__content">
        <form className="auth__form" onSubmit={handleSubmit}>
          <input
            id="signup-email"
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
              id="signup-password"
              className="auth__input auth__input--with-toggle"
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              className="auth__toggle"
              type="button"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>

          <div className="auth__field">
            <input
              id="signup-password-confirm"
              className="auth__input auth__input--with-toggle"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirme a senha"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              className="auth__toggle"
              type="button"
              aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showConfirmPassword}
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              <span className="material-symbols-rounded" aria-hidden="true">
                {showConfirmPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>

          {errorMessage ? (
            <p className="auth__status" role="alert">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="auth__status auth__status--success" role="status">
              {successMessage}
            </p>
          ) : null}

          <div className="auth__actions">
            <button
              className="button button--primary button--block"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando..." : "Criar conta"}
            </button>
          </div>
        </form>

        <p className="auth__switch">
          Ja tem conta?{" "}
          <button className="button button--link" type="button" onClick={onSwitchMode}>
            Entrar
          </button>
        </p>
      </section>
    </main>
  );
};

export default SignUpPage;
