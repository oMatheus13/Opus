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
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const { error } = await signUp({
      email: email.trim(),
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
      <section className="auth__card">
        <img className="auth__logo" src={opusLogo} alt="Opus" />

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
              className="auth__input"
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

          <button
            className="button button--primary button--block"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Criando..." : "Criar conta"}
          </button>
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
