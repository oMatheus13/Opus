import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

type EmailVerificationBannerProps = {
  email?: string | null;
  isConfirmed: boolean;
  isDev?: boolean;
};

const EmailVerificationBanner = ({
  email,
  isConfirmed,
  isDev = false
}: EmailVerificationBannerProps) => {
  const { resendVerification } = useAuth();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (!email || isConfirmed || isDev || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setStatus("sending");
    setMessage(null);

    const { error } = await resendVerification(email);

    if (error) {
      setStatus("error");
      setMessage("Não foi possível enviar o e-mail de confirmação.");
      return;
    }

    setStatus("sent");
    setMessage("E-mail de confirmação enviado.");
  };

  return (
    <aside className="email-banner app-glass" role="status" aria-live="polite">
      <div className="email-banner__content">
        <div className="email-banner__icon" aria-hidden="true">
          <i className="fi fi-sr-envelope" aria-hidden="true" />
        </div>
        <div>
          <p className="email-banner__title">Confirme seu e-mail</p>
          <p className="email-banner__copy">
            Para manter sua conta segura, confirme quando puder.
          </p>
          {message ? (
            <p
              className={`email-banner__message ${
                status === "error" ? "is-error" : "is-success"
              }`}
              role={status === "error" ? "alert" : "status"}
            >
              {message}
            </p>
          ) : null}
        </div>
      </div>
      <div className="email-banner__actions">
        <button
          className="button button--ghost button--sm"
          type="button"
          onClick={handleResend}
          disabled={status === "sending"}
        >
          {status === "sending" ? "Enviando..." : "Reenviar"}
        </button>
        <button
          className="button button--link button--sm"
          type="button"
          onClick={() => setDismissed(true)}
        >
          Depois
        </button>
      </div>
    </aside>
  );
};

export default EmailVerificationBanner;
