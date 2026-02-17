export type QuickActionId =
  | "new-income"
  | "new-expense"
  | "transfer"
  | "add-investment"
  | "pay-card";

export type QuickAction = {
  id: QuickActionId;
  label: string;
  icon: string;
};

export const quickActions: QuickAction[] = [
  { id: "new-income", label: "Nova entrada", icon: "plus" },
  { id: "new-expense", label: "Nova saída", icon: "minus" },
  { id: "transfer", label: "Transferir", icon: "exchange" },
  { id: "add-investment", label: "Novo aporte", icon: "chart-line-up" },
  { id: "pay-card", label: "Pagar fatura", icon: "credit-card" }
];

export const QUICK_ACTION_KEY = "opus.quick-action";
export const QUICK_ACTION_ENABLED_KEY = "opus.quick-action.enabled";
const QUICK_ACTION_EVENT = "opus:quick-action";
const QUICK_ACTION_ENABLED_EVENT = "opus:quick-action-enabled";

const resolveAction = (id?: string | null): QuickActionId => {
  const fallback = quickActions[0].id;
  if (!id) {
    return fallback;
  }

  return quickActions.some((action) => action.id === id) ? (id as QuickActionId) : fallback;
};

export const getStoredQuickAction = (): QuickActionId => {
  if (typeof window === "undefined") {
    return quickActions[0].id;
  }

  const stored = localStorage.getItem(QUICK_ACTION_KEY);
  return resolveAction(stored);
};

export const setStoredQuickAction = (id: QuickActionId) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(QUICK_ACTION_KEY, id);
  window.dispatchEvent(new CustomEvent(QUICK_ACTION_EVENT, { detail: id }));
};

export const getStoredQuickActionEnabled = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(QUICK_ACTION_ENABLED_KEY) === "1";
};

export const setStoredQuickActionEnabled = (enabled: boolean) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(QUICK_ACTION_ENABLED_KEY, enabled ? "1" : "0");
  window.dispatchEvent(
    new CustomEvent(QUICK_ACTION_ENABLED_EVENT, { detail: enabled })
  );
};

export const subscribeQuickAction = (callback: (id: QuickActionId) => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleEvent = (event: Event) => {
    const detail = (event as CustomEvent).detail as string | undefined;
    callback(resolveAction(detail));
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === QUICK_ACTION_KEY) {
      callback(resolveAction(event.newValue));
    }
  };

  window.addEventListener(QUICK_ACTION_EVENT, handleEvent);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(QUICK_ACTION_EVENT, handleEvent);
    window.removeEventListener("storage", handleStorage);
  };
};

export const subscribeQuickActionEnabled = (callback: (enabled: boolean) => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleEvent = (event: Event) => {
    const detail = (event as CustomEvent).detail as boolean | undefined;
    callback(Boolean(detail));
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === QUICK_ACTION_ENABLED_KEY) {
      callback(event.newValue === "1");
    }
  };

  window.addEventListener(QUICK_ACTION_ENABLED_EVENT, handleEvent);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(QUICK_ACTION_ENABLED_EVENT, handleEvent);
    window.removeEventListener("storage", handleStorage);
  };
};
