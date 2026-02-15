import type { MouseEventHandler } from "react";

type AppTopBarProps = {
  maskData: boolean;
  onToggleMask: () => void;
  theme: "light" | "dark";
  onToggleTheme: MouseEventHandler<HTMLButtonElement>;
  onProfileClick?: () => void;
  greeting: string;
  displayName: string;
  avatarUrl?: string | null;
};

const AppTopBar = ({
  maskData,
  onToggleMask,
  theme,
  onToggleTheme,
  onProfileClick,
  greeting,
  displayName,
  avatarUrl
}: AppTopBarProps) => {
  const themeLabel = theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro";
  const themeIcon = theme === "dark" ? "sun" : "moon";

  return (
    <header className="app-topbar app-glass">
      <button
        className="app-topbar__profile"
        type="button"
        title="Perfil"
        onClick={onProfileClick}
      >
        {avatarUrl ? (
          <img className="app-topbar__avatar" src={avatarUrl} alt={`Avatar de ${displayName}`} />
        ) : (
          <div className="app-topbar__avatar app-topbar__avatar--fallback" aria-hidden="true">
            <i className="fi fi-sr-user" aria-hidden="true" />
          </div>
        )}
        <div className="app-topbar__copy">
          <span className="app-topbar__greeting">{greeting},</span>
          <span className="app-topbar__name">{displayName}!</span>
        </div>
      </button>
      <div className="app-topbar__actions">
        <button
          className="app-topbar__action"
          type="button"
          onClick={onToggleMask}
          aria-pressed={maskData}
          title={maskData ? "Mostrar dados" : "Ocultar dados"}
        >
          <i
            className={`fi fi-sr-${maskData ? "eye-lashes" : "eye"}`}
            aria-hidden="true"
          />
        </button>
        <button
          className="app-topbar__action"
          type="button"
          onClick={onToggleTheme}
          aria-pressed={theme === "dark"}
          title={themeLabel}
        >
          <i className={`fi fi-sr-${themeIcon}`} aria-hidden="true" />
        </button>
        <button className="app-topbar__action" type="button" title="Notificacoes">
          <i className="fi fi-sr-bell" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};

export default AppTopBar;
