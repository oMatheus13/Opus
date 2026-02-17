export type ThemeMode = "light" | "dark";

export const getStoredTheme = (): ThemeMode | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem("opus.theme");
  return stored === "light" || stored === "dark" ? stored : null;
};

export const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = getStoredTheme();
  if (stored) {
    return stored;
  }

  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") {
    return attr;
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const applyTheme = (theme: ThemeMode) => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("opus.theme", theme);
};
