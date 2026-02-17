import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "../hooks/useAuth";
import EmailVerificationBanner from "../components/EmailVerificationBanner";
import AppNavDock from "./AppNavDock";
import AppTopBar from "./AppTopBar";
import HomePage from "../pages/Home/HomePage";
import CreditoPage from "../pages/Credito/CreditoPage";
import ConfiguracoesPage from "../pages/Configuracoes/ConfiguracoesPage";
import SectionPlaceholder from "../pages/Sections/SectionPlaceholder";
import WelcomePage from "../pages/Onboarding/WelcomePage";
import SetupPage from "../pages/Onboarding/SetupPage";
import { applyTheme, getInitialTheme, type ThemeMode } from "../utils/theme";
import { applySkin, getInitialSkin, type SkinMode } from "../utils/skin";
import { savePreOnboarding } from "../utils/onboarding";
import { MAIN_NAV_ITEMS, type MainNavKey } from "./AppNavBar";

type AppShellProps = {
  children?: ReactNode;
};

type DevView = "welcome" | "setup";
type AppView = MainNavKey | "settings";

const AppShell = ({ children }: AppShellProps) => {
  const [maskData, setMaskData] = useState(false);
  const [activeView, setActiveView] = useState<AppView>("home");
  const [devView, setDevView] = useState<DevView | null>(null);
  const { user } = useAuth();
  const isDev = import.meta.env.DEV;
  const cleanupTimeoutRef = useRef<number | null>(null);
  const initialMaskRef = useRef(false);
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());
  const [skin, setSkin] = useState<SkinMode>(() => getInitialSkin());

  const resolveDisplayName = (currentUser: User | null) => {
    const metadata = currentUser?.user_metadata as Record<string, unknown> | undefined;
    const name =
      (metadata?.name as string | undefined) ??
      (metadata?.full_name as string | undefined) ??
      (metadata?.display_name as string | undefined);

    if (name) {
      return name;
    }

    if (currentUser?.email) {
      return currentUser.email.split("@")[0];
    }

    return "Usuário";
  };

  const resolveGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Bom dia";
    }

    if (hour >= 12 && hour < 18) {
      return "Boa tarde";
    }

    return "Boa noite";
  };

  const displayName = resolveDisplayName(user);
  const greeting = resolveGreeting();
  const avatarUrl = (user?.user_metadata as { avatar_url?: string } | undefined)
    ?.avatar_url;
  const isEmailConfirmed = Boolean(user?.email_confirmed_at || user?.confirmed_at);
  const isDevUser = (user?.app_metadata as { provider?: string } | undefined)?.provider === "dev";

  const handleThemeChange = (nextTheme: ThemeMode) => {
    if (nextTheme === theme) {
      return;
    }

    const root = document.documentElement;

    if (cleanupTimeoutRef.current) {
      window.clearTimeout(cleanupTimeoutRef.current);
    }

    root.classList.add("theme-transition");
    setTheme(nextTheme);

    cleanupTimeoutRef.current = window.setTimeout(() => {
      root.classList.remove("theme-transition");
      cleanupTimeoutRef.current = null;
    }, 320);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applySkin(skin);
  }, [skin]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const metadata = user.user_metadata as Record<string, unknown> | undefined;
    const storedTheme = metadata?.theme;
    const storedSkin = metadata?.skin;

    if ((storedTheme === "light" || storedTheme === "dark") && storedTheme !== theme) {
      setTheme(storedTheme);
    }

    if ((storedSkin === "clean" || storedSkin === "glass") && storedSkin !== skin) {
      setSkin(storedSkin);
    }
  }, [user, theme, skin]);

  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        window.clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!user || initialMaskRef.current) {
      return;
    }

    const metadata = user.user_metadata as Record<string, unknown> | undefined;
    if (metadata?.privacy_masked) {
      setMaskData(true);
    }

    initialMaskRef.current = true;
  }, [user]);

  const handleSettingsClick = () => {
    setActiveView((prev) => (prev === "settings" ? "home" : "settings"));
  };

  const isMainView = MAIN_NAV_ITEMS.some((item) => item.key === activeView);
  const activeNavKey = isMainView ? (activeView as MainNavKey) : null;
  const contextMap: Record<string, { label: string; icon: string }> = {
    settings: { label: "Configurações", icon: "settings" }
  };
  const contextData = !isMainView
    ? contextMap[activeView] ?? { label: "Detalhes", icon: "apps" }
    : null;

  const handleDevNavigate = (next: DevView) => {
    setDevView(next);
  };

  if (devView === "welcome") {
    return (
      <WelcomePage
        onComplete={(data) => {
          savePreOnboarding(data);
          if (data.theme) {
            applyTheme(data.theme);
            setTheme(data.theme);
          }
          setDevView(null);
        }}
        onExit={() => {
          setDevView(null);
          setTheme(getInitialTheme());
        }}
        showExit={isDev}
      />
    );
  }

  if (devView === "setup") {
    return (
      <SetupPage
        onComplete={() => setDevView(null)}
        onExit={() => {
          setDevView(null);
          setTheme(getInitialTheme());
        }}
        showExit={isDev}
      />
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case "settings":
        return (
          <ConfiguracoesPage
            displayName={displayName}
            email={user?.email ?? ""}
            theme={theme}
            skin={skin}
            onThemeChange={handleThemeChange}
            onSkinChange={setSkin}
          />
        );
      case "credit":
        return <CreditoPage />;
      case "investments":
        return <SectionPlaceholder icon="chart-line-up" text="Investimentos em breve." />;
      case "purchases":
        return <SectionPlaceholder icon="shopping-cart" text="Compras em breve." />;
      case "more":
        return <SectionPlaceholder icon="apps" text="Mais opções em breve." />;
      case "home":
      default:
        return children ?? <HomePage />;
    }
  };

  return (
    <main
      className="app-shell"
      data-privacy={maskData ? "masked" : "open"}
      data-skin={skin}
    >
      <AppTopBar
        maskData={maskData}
        onToggleMask={() => setMaskData((prev) => !prev)}
        onSettingsClick={handleSettingsClick}
        displayName={displayName}
        greeting={greeting}
        avatarUrl={avatarUrl}
        isDev={isDev}
        devDestination={devView}
        onSelectDevDestination={handleDevNavigate}
      />

      <EmailVerificationBanner
        email={user?.email}
        isConfirmed={isEmailConfirmed}
        isDev={isDevUser}
      />

      <section className="app-content">{renderContent()}</section>

      <AppNavDock
        contextLabel={contextData?.label ?? ""}
        contextIcon={contextData?.icon ?? "apps"}
        showContext={!isMainView}
        activeKey={activeNavKey}
        onSelect={(key) => setActiveView(key)}
      />
    </main>
  );
};

export default AppShell;
