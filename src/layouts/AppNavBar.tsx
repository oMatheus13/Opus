import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";

export type MainNavKey = "home" | "credit" | "investments" | "purchases" | "more";

export const MAIN_NAV_ITEMS: Array<{
  key: MainNavKey;
  label: string;
  icon: string;
}> = [
  { key: "home", label: "Home", icon: "home" },
  { key: "credit", label: "Crédito", icon: "credit-card" },
  { key: "investments", label: "Investimentos", icon: "chart-line-up" },
  { key: "purchases", label: "Compras", icon: "shopping-cart" },
  { key: "more", label: "Todos", icon: "apps" }
];

type AppNavBarProps = {
  activeKey?: MainNavKey | null;
  onSelect?: (key: MainNavKey) => void;
};

const AppNavBar = ({ activeKey, onSelect }: AppNavBarProps) => {
  const [internalActive, setInternalActive] = useState<MainNavKey>(MAIN_NAV_ITEMS[0].key);
  const [indicatorStyle, setIndicatorStyle] = useState<{ width: string; left: string }>({
    width: "0px",
    left: "0px"
  });
  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const currentKey = activeKey !== undefined ? activeKey : internalActive;
  const activeIndex = useMemo(() => {
    if (!currentKey) {
      return -1;
    }

    return MAIN_NAV_ITEMS.findIndex((item) => item.key === currentKey);
  }, [currentKey]);

  const updateIndicator = useCallback(() => {
    const nav = navRef.current;

    if (!nav) {
      return;
    }

    if (activeIndex < 0) {
      setIndicatorStyle({
        width: "0px",
        left: "0px"
      });
      setIndicatorVisible(false);
      return;
    }

    const items = nav.querySelectorAll<HTMLButtonElement>(".app-nav__item");
    const activeItem = items[activeIndex];

    if (!activeItem) {
      setIndicatorVisible(false);
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const left = itemRect.left - navRect.left;

    setIndicatorStyle({
      width: `${itemRect.width}px`,
      left: `${left}px`
    });
    setIndicatorVisible(true);
  }, [activeIndex]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    const handleResize = () => updateIndicator();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateIndicator]);

  return (
    <nav
      className="app-nav app-nav--main app-glass"
      aria-label="Navegação principal"
      ref={navRef}
    >
      <span
        className={`app-nav__indicator${indicatorVisible ? "" : " is-hidden"}`}
        aria-hidden="true"
        style={{
          width: indicatorStyle.width,
          transform: `translateX(${indicatorStyle.left})`
        }}
      />
      {MAIN_NAV_ITEMS.map((item) => {
        const isActive = item.key === currentKey;

        return (
          <button
            key={item.key}
            className={`app-nav__item${isActive ? " is-active" : ""}`}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => {
              if (onSelect) {
                onSelect(item.key);
                return;
              }

              setInternalActive(item.key);
            }}
          >
            <i className={`fi fi-sr-${item.icon}`} aria-hidden="true" />
            <span className="app-nav__label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default AppNavBar;
