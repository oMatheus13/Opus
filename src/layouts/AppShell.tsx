import { useEffect, useRef, useState } from "react";
import type { MouseEventHandler, ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "../hooks/useAuth";
import AppNavBar from "./AppNavBar";
import AppTopBar from "./AppTopBar";
import HomePage from "../pages/Home/HomePage";
import ProfilePage from "../pages/Profile/ProfilePage";

type AppShellProps = {
  children?: ReactNode;
};

type ThemeMode = "light" | "dark";

const AppShell = ({ children }: AppShellProps) => {
  const [maskData, setMaskData] = useState(false);
  const [activeView, setActiveView] = useState<"home" | "profile">("home");
  const { user } = useAuth();
  const cleanupTimeoutRef = useRef<number | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const stored = localStorage.getItem("opus.theme");
    if (stored === "light" || stored === "dark") {
      return stored;
    }

    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

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

    return "Usuario";
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

  const handleToggleTheme: MouseEventHandler<HTMLButtonElement> = () => {
    const root = document.documentElement;
    const nextTheme = theme === "dark" ? "light" : "dark";

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
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("opus.theme", theme);
  }, [theme]);

  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        window.clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  const handleProfileClick = () => {
    setActiveView((prev) => (prev === "profile" ? "home" : "profile"));
  };

  const content =
    activeView === "profile" ? (
      <ProfilePage
        displayName={displayName}
        email={user?.email ?? ""}
        onClose={() => setActiveView("home")}
      />
    ) : (
      children ?? <HomePage />
    );

  return (
    <main className="app-shell" data-privacy={maskData ? "masked" : "open"}>
      <AppTopBar
        maskData={maskData}
        onToggleMask={() => setMaskData((prev) => !prev)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onProfileClick={handleProfileClick}
        displayName={displayName}
        greeting={greeting}
        avatarUrl={avatarUrl}
      />

      <section className="app-content">{content}</section>

      <AppNavBar />
    </main>
  );
};

export default AppShell;
