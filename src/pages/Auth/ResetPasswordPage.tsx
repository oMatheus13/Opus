import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import opusLogo from "../../assets/brand/opus-logotipo.svg";

type ResetPasswordPageProps = {
  onComplete: () => void;
};

const ResetPasswordPage = ({ onComplete }: ResetPasswordPageProps) => {
  const { updateUser, signOut } = useAuth();
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

    if (!password) {
      setErrorMessage("Informe uma nova senha.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não conferem.");
      return;
    }

    setIsSubmitting(true);
    const { error } = await updateUser({ password });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage("Senha atualizada. Faça login novamente.");
    await signOut();
    setIsSubmitting(false);
    onComplete();
  };

  return (
    <main className="auth">
      <header className="auth__topbar">
        <img className="auth__logo" src={opusLogo} alt="Opus" />
      </header>

      <section className="auth__content">
        <form className="auth__form" onSubmit={handleSubmit}>
          <p className="auth__helper">
            Crie uma nova senha para continuar.
          </p>

          <div className="auth__field">
            <input
              id="reset-password"
              className="auth__input auth__input--with-toggle"
              type={showPassword ? "text" : "password"}
              placeholder="Nova senha"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
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

          <div className="auth__field">
            <input
              id="reset-password-confirm"
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
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showConfirmPassword}
            >
              <i
                className={`fi fi-sr-${showConfirmPassword ? "eye" : "eye-crossed"}`}
                aria-hidden="true"
              />
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
              {isSubmitting ? "Salvando..." : "Atualizar senha"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default ResetPasswordPage;
