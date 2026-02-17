import { getInitialTheme, type ThemeMode } from "./theme";

export type PreOnboardingData = {
  theme: ThemeMode;
  country: string;
  currency: string;
  objective: string;
};

export const PRE_ONBOARDING_KEY = "opus.preonboarding";
export const PRE_ONBOARDING_COMPLETED_KEY = "opus.preonboarding.completed";

const DEFAULT_PRE_ONBOARDING: PreOnboardingData = {
  theme: getInitialTheme(),
  country: "Brasil",
  currency: "BRL",
  objective: "organizar"
};

export const readPreOnboarding = (): PreOnboardingData => {
  if (typeof window === "undefined") {
    return DEFAULT_PRE_ONBOARDING;
  }

  try {
    const raw = localStorage.getItem(PRE_ONBOARDING_KEY);
    if (!raw) {
      return DEFAULT_PRE_ONBOARDING;
    }

    const parsed = JSON.parse(raw) as Partial<PreOnboardingData>;
    return {
      ...DEFAULT_PRE_ONBOARDING,
      ...parsed
    };
  } catch {
    return DEFAULT_PRE_ONBOARDING;
  }
};

export const savePreOnboarding = (data: PreOnboardingData) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(PRE_ONBOARDING_KEY, JSON.stringify(data));
  localStorage.setItem(PRE_ONBOARDING_COMPLETED_KEY, "1");
};
