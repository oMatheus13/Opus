import { useEffect, useMemo, useState } from "react";
import AppNavBar, { type MainNavKey } from "./AppNavBar";
import {
  getStoredQuickActionEnabled,
  getStoredQuickAction,
  quickActions,
  subscribeQuickAction,
  subscribeQuickActionEnabled,
  type QuickActionId
} from "../utils/quickActions";

type AppNavDockProps = {
  contextLabel: string;
  contextIcon: string;
  showContext?: boolean;
  activeKey: MainNavKey | null;
  onSelect: (key: MainNavKey) => void;
};

const AppNavDock = ({
  contextLabel,
  contextIcon,
  showContext = true,
  activeKey,
  onSelect
}: AppNavDockProps) => {
  const [actionId, setActionId] = useState<QuickActionId>(getStoredQuickAction);
  const [shortcutEnabled, setShortcutEnabled] = useState(getStoredQuickActionEnabled);
  const [lastContext, setLastContext] = useState({
    label: contextLabel,
    icon: contextIcon
  });

  useEffect(() => {
    return subscribeQuickAction((next) => setActionId(next));
  }, []);

  useEffect(() => {
    return subscribeQuickActionEnabled((next) => setShortcutEnabled(next));
  }, []);

  useEffect(() => {
    if (showContext) {
      setLastContext({ label: contextLabel, icon: contextIcon });
    }
  }, [showContext, contextLabel, contextIcon]);

  const activeAction = useMemo(() => {
    return quickActions.find((action) => action.id === actionId) ?? quickActions[0];
  }, [actionId]);

  return (
    <div
      className="app-dock"
      data-context={showContext ? "active" : "inactive"}
      data-shortcut={shortcutEnabled ? "active" : "inactive"}
    >
      <div className="app-nav app-nav--context app-glass" aria-label="Página atual">
        <div
          className={`app-nav__item app-nav__item--static${
            showContext ? " is-active" : ""
          }`}
          aria-current={showContext ? "page" : undefined}
        >
          <i className={`fi fi-sr-${lastContext.icon}`} aria-hidden="true" />
          <span className="app-nav__label">{lastContext.label}</span>
        </div>
      </div>

      <AppNavBar activeKey={activeKey} onSelect={onSelect} />

      <div className="app-nav app-nav--shortcut app-glass" aria-label="Atalho rápido">
        <button className="app-nav__item" type="button">
          <i className={`fi fi-sr-${activeAction.icon}`} aria-hidden="true" />
          <span className="app-nav__label">{activeAction.label}</span>
        </button>
      </div>
    </div>
  );
};

export default AppNavDock;
