import { useRef } from "react";

type DevDestination = "welcome" | "setup";

type AppTopBarProps = {
  maskData: boolean;
  onToggleMask: () => void;
  onSettingsClick?: () => void;
  greeting: string;
  displayName: string;
  avatarUrl?: string | null;
  isDev?: boolean;
  devDestination?: DevDestination | null;
  onSelectDevDestination?: (destination: DevDestination) => void;
};

const AppTopBar = ({
  maskData,
  onToggleMask,
  onSettingsClick,
  greeting,
  displayName,
  avatarUrl,
  isDev,
  devDestination = null,
  onSelectDevDestination
}: AppTopBarProps) => {
  const devMenuRef = useRef<HTMLDetailsElement | null>(null);
  const showDevMenu = Boolean(isDev && onSelectDevDestination);
  const devOptions: Array<{ value: DevDestination; label: string }> = [
    { value: "welcome", label: "Boas-vindas" },
    { value: "setup", label: "Setup inicial" }
  ];

  const handleDevSelect = (destination: DevDestination) => {
    onSelectDevDestination?.(destination);
    if (devMenuRef.current) {
      devMenuRef.current.removeAttribute("open");
    }
  };

  return (
    <header className="app-topbar app-glass">
      <button
        className="app-topbar__settings"
        type="button"
        title="Configurações"
        onClick={onSettingsClick}
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
        {showDevMenu ? (
          <details className="app-topbar__dev" ref={devMenuRef}>
            <summary
              className="app-topbar__action"
              title="Atalhos de dev"
              aria-label="Atalhos de dev"
            >
              <i className="fi fi-sr-code-simple" aria-hidden="true" />
            </summary>
            <div className="app-topbar__dev-menu app-glass">
              <p className="app-topbar__dev-title">Atalhos de dev</p>
              {devOptions.map((option) => (
                <button
                  key={option.value}
                  className={`app-topbar__dev-item${
                    devDestination === option.value ? " is-active" : ""
                  }`}
                  type="button"
                  onClick={() => handleDevSelect(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </details>
        ) : null}
        <button
          className="app-topbar__action"
          type="button"
          onClick={onToggleMask}
          aria-pressed={maskData}
          title={maskData ? "Mostrar dados" : "Ocultar dados"}
        >
          <i
            className={`fi fi-sr-${maskData ? "eye-crossed" : "eye"}`}
            aria-hidden="true"
          />
        </button>
        <button className="app-topbar__action" type="button" title="Notificações">
          <i className="fi fi-sr-bell" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};

export default AppTopBar;
