import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import type { ThemeMode } from "../../utils/theme";
import type { SkinMode } from "../../utils/skin";
import {
  getStoredQuickAction,
  QUICK_ACTION_KEY,
  QUICK_ACTION_ENABLED_KEY,
  quickActions,
  setStoredQuickAction,
  setStoredQuickActionEnabled,
  type QuickActionId
} from "../../utils/quickActions";

type ConfiguracoesPageProps = {
  displayName: string;
  email: string;
  theme: ThemeMode;
  skin: SkinMode;
  onThemeChange: (theme: ThemeMode) => void;
  onSkinChange: (skin: SkinMode) => void;
};

const ConfiguracoesPage = ({
  displayName,
  email,
  theme,
  skin,
  onThemeChange,
  onSkinChange
}: ConfiguracoesPageProps) => {
  const { signOut, updateUser, user } = useAuth();
  const metadata = useMemo(() => {
    return (user?.user_metadata as Record<string, unknown> | undefined) ?? {};
  }, [user]);
  const defaultTimezone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "America/Sao_Paulo";
  const [fullName, setFullName] = useState(displayName);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currency, setCurrency] = useState("BRL");
  const [timezone, setTimezone] = useState(defaultTimezone);
  const [privacyMask, setPrivacyMask] = useState(false);
  const [quickActionId, setQuickActionId] = useState<QuickActionId>(getStoredQuickAction);
  const [quickActionEnabled, setQuickActionEnabled] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const themeOptions: Array<{ value: ThemeMode; label: string; description: string }> = [
    { value: "light", label: "Claro", description: "Interface clara e luminosa" },
    { value: "dark", label: "Escuro", description: "Menos brilho e mais foco" }
  ];
  const skinOptions: Array<{ value: SkinMode; label: string; description: string }> = [
    { value: "clean", label: "Padrão", description: "Sólido e minimalista" },
    { value: "glass", label: "Glass", description: "Transparências suaves" }
  ];

  useEffect(() => {
    if (!user) {
      return;
    }

    const meta = metadata;
    const savedFullName =
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      displayName;

    setFullName(savedFullName);
    setAvatarUrl((meta.avatar_url as string | undefined) ?? "");
    setCurrency((meta.currency as string | undefined) ?? "BRL");
    setTimezone((meta.timezone as string | undefined) ?? defaultTimezone);
    setPrivacyMask(Boolean(meta.privacy_masked));
    const storedEnabled = meta.quick_action_enabled as boolean | undefined;
    if (typeof window !== "undefined") {
      const localStored = window.localStorage.getItem(QUICK_ACTION_ENABLED_KEY);
      if (!localStored) {
        const enabledValue = Boolean(storedEnabled);
        setQuickActionEnabled(enabledValue);
        setStoredQuickActionEnabled(enabledValue);
      } else {
        setQuickActionEnabled(localStored === "1");
      }
    }
    const storedQuickAction = meta.quick_action as QuickActionId | undefined;
    if (storedQuickAction && typeof window !== "undefined") {
      const localStored = window.localStorage.getItem(QUICK_ACTION_KEY);
      if (!localStored) {
        setQuickActionId(storedQuickAction);
        setStoredQuickAction(storedQuickAction);
      }
    }
    if (typeof window !== "undefined") {
      const localAction = window.localStorage.getItem(QUICK_ACTION_KEY);
      if (localAction) {
        setQuickActionId(localAction as QuickActionId);
      }
    }
  }, [user, metadata, displayName, defaultTimezone]);

  const handleSave = async () => {
    setStatusMessage(null);
    setErrorMessage(null);
    setIsSaving(true);

    const trimmedName = fullName.trim();
    const nameParts = trimmedName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ");

    const { error } = await updateUser({
      data: {
        name: firstName,
        first_name: firstName,
        last_name: lastName,
        full_name: trimmedName || displayName,
        avatar_url: avatarUrl.trim() || null,
        currency,
        timezone,
        theme,
        skin,
        privacy_masked: privacyMask,
        quick_action: quickActionId
      }
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSaving(false);
      return;
    }

    setStoredQuickAction(quickActionId);
    setStatusMessage("Configurações atualizadas.");
    setIsSaving(false);
  };

  const handleThemeSelect = async (nextTheme: ThemeMode) => {
    if (nextTheme === theme) {
      return;
    }

    setStatusMessage(null);
    setErrorMessage(null);
    onThemeChange(nextTheme);

    const { error } = await updateUser({
      data: { theme: nextTheme }
    });

    if (error) {
      setErrorMessage(error.message);
    }
  };

  const handleSkinSelect = async (nextSkin: SkinMode) => {
    if (nextSkin === skin) {
      return;
    }

    setStatusMessage(null);
    setErrorMessage(null);
    onSkinChange(nextSkin);

    const { error } = await updateUser({
      data: { skin: nextSkin }
    });

    if (error) {
      setErrorMessage(error.message);
    }
  };

  const handleQuickActionSave = async () => {
    setStatusMessage(null);
    setErrorMessage(null);
    setIsSaving(true);

    setStoredQuickAction(quickActionId);
    setStoredQuickActionEnabled(quickActionEnabled);
    const { error } = await updateUser({
      data: {
        quick_action: quickActionId,
        quick_action_enabled: quickActionEnabled
      }
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSaving(false);
      return;
    }

    setStatusMessage("Atalho atualizado.");
    setIsSaving(false);
  };

  const handleExport = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      user: {
        id: user?.id ?? null,
        email: user?.email ?? null,
        created_at: user?.created_at ?? null
      },
      metadata
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `opus-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="configuracoes">
      <div className="configuracoes__grid">
        <section className="configuracoes__card app-glass">
          <h2 className="configuracoes__section-title">Dados pessoais</h2>
          <div className="configuracoes__identity">
            <div className="configuracoes__avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt={`Foto de ${displayName}`} />
              ) : (
                <i className="fi fi-sr-user" aria-hidden="true" />
              )}
            </div>
            <div className="configuracoes__fields">
              <label className="configuracoes__label" htmlFor="configuracoes-name">
                Nome completo
              </label>
              <input
                id="configuracoes-name"
                className="configuracoes__input"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Seu nome"
              />
              <label className="configuracoes__label" htmlFor="configuracoes-avatar">
                Foto (URL)
              </label>
              <input
                id="configuracoes-avatar"
                className="configuracoes__input"
                type="text"
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="configuracoes__field-grid">
            <div className="configuracoes__field">
              <label className="configuracoes__label" htmlFor="configuracoes-email">
                E-mail
              </label>
              <input
                id="configuracoes-email"
                className="configuracoes__input"
                type="email"
                value={email || "Sem e-mail"}
                readOnly
              />
            </div>
            <div className="configuracoes__field">
              <label className="configuracoes__label" htmlFor="configuracoes-currency">
                Moeda
              </label>
              <select
                id="configuracoes-currency"
                className="configuracoes__input configuracoes__select"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
              >
                <option value="BRL">Real (BRL)</option>
                <option value="USD">Dólar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">Libra (GBP)</option>
              </select>
            </div>
            <div className="configuracoes__field">
              <label className="configuracoes__label" htmlFor="configuracoes-timezone">
                Fuso horário
              </label>
              <input
                id="configuracoes-timezone"
                className="configuracoes__input"
                type="text"
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                placeholder="America/Sao_Paulo"
              />
            </div>
          </div>

          {errorMessage ? (
            <p className="configuracoes__status configuracoes__status--error" role="alert">
              {errorMessage}
            </p>
          ) : null}

          {statusMessage ? (
            <p className="configuracoes__status configuracoes__status--success" role="status">
              {statusMessage}
            </p>
          ) : null}

          <div className="configuracoes__actions">
            <button
              className="button button--primary"
              type="button"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar dados"}
            </button>
            <button className="button button--ghost" type="button" onClick={signOut}>
              Sair
            </button>
          </div>
        </section>

        <section className="configuracoes__card app-glass">
          <h2 className="configuracoes__section-title">Aparência</h2>
          <p className="configuracoes__hint">
            Defina o tema e o estilo visual do app.
          </p>
          <div className="configuracoes__group">
            <span className="configuracoes__group-title">Tema</span>
            <div className="configuracoes__options">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  className={`configuracoes__option${
                    theme === option.value ? " is-active" : ""
                  }`}
                  type="button"
                  onClick={() => handleThemeSelect(option.value)}
                  aria-pressed={theme === option.value}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="configuracoes__group">
            <span className="configuracoes__group-title">Skin</span>
            <div className="configuracoes__options">
              {skinOptions.map((option) => (
                <button
                  key={option.value}
                  className={`configuracoes__option${
                    skin === option.value ? " is-active" : ""
                  }`}
                  type="button"
                  onClick={() => handleSkinSelect(option.value)}
                  aria-pressed={skin === option.value}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="configuracoes__card app-glass">
          <h2 className="configuracoes__section-title">Privacidade</h2>
          <p className="configuracoes__hint">
            Defina o que fica oculto automaticamente no app.
          </p>
          <label className="toggle configuracoes__toggle" htmlFor="configuracoes-privacy-mask">
            <input
              id="configuracoes-privacy-mask"
              type="checkbox"
              checked={privacyMask}
              onChange={(event) => setPrivacyMask(event.target.checked)}
            />
            <span className="toggle__track" aria-hidden="true">
              <span className="toggle__thumb" />
            </span>
            <span className="toggle__label">Ocultar valores por padrão</span>
          </label>
          <button className="button button--ghost button--sm" type="button" onClick={handleSave}>
            Salvar privacidade
          </button>
        </section>

        <section className="configuracoes__card app-glass">
          <h2 className="configuracoes__section-title">Atalho rápido</h2>
          <p className="configuracoes__hint">
            Escolha o botão que aparece ao lado da navbar.
          </p>
          <label className="toggle configuracoes__toggle" htmlFor="configuracoes-quick-enabled">
            <input
              id="configuracoes-quick-enabled"
              type="checkbox"
              checked={quickActionEnabled}
              onChange={(event) => setQuickActionEnabled(event.target.checked)}
            />
            <span className="toggle__track" aria-hidden="true">
              <span className="toggle__thumb" />
            </span>
            <span className="toggle__label">Mostrar atalho</span>
          </label>
          <div className="configuracoes__field">
            <label className="configuracoes__label" htmlFor="configuracoes-quick-action">
              Atalho
            </label>
            <select
              id="configuracoes-quick-action"
              className="configuracoes__input configuracoes__select"
              value={quickActionId}
              onChange={(event) => setQuickActionId(event.target.value as QuickActionId)}
              disabled={!quickActionEnabled}
            >
              {quickActions.map((action) => (
                <option key={action.id} value={action.id}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>
          <button
            className="button button--ghost button--sm"
            type="button"
            onClick={handleQuickActionSave}
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar atalho"}
          </button>
        </section>

        <section className="configuracoes__card app-glass">
          <h2 className="configuracoes__section-title">Backup rápido</h2>
          <p className="configuracoes__hint">
            Baixe um resumo das suas configurações em JSON.
          </p>
          <button className="button button--secondary" type="button" onClick={handleExport}>
            Exportar dados
          </button>
        </section>
      </div>
    </section>
  );
};

export default ConfiguracoesPage;
