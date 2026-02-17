export type SkinMode = "clean" | "glass";

const SKIN_KEY = "opus.skin";

export const getStoredSkin = (): SkinMode | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(SKIN_KEY);
  return stored === "clean" || stored === "glass" ? stored : null;
};

export const getInitialSkin = (): SkinMode => {
  if (typeof window === "undefined") {
    return "clean";
  }

  const stored = getStoredSkin();
  if (stored) {
    return stored;
  }

  const attr = document.documentElement.getAttribute("data-skin");
  if (attr === "clean" || attr === "glass") {
    return attr;
  }

  return "clean";
};

export const applySkin = (skin: SkinMode) => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute("data-skin", skin);
  localStorage.setItem(SKIN_KEY, skin);
};
