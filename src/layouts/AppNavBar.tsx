import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const navItems = [
  { label: "Home", icon: "home" },
  { label: "Crédito", icon: "credit-card" },
  { label: "Investimentos", icon: "chart-line-up" },
  { label: "Compras", icon: "shopping-cart" },
  { label: "Todos", icon: "apps" }
];

const AppNavBar = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState<{ width: string; left: string }>({
    width: "0px",
    left: "0px"
  });
  const navRef = useRef<HTMLElement | null>(null);

  const updateIndicator = useCallback(() => {
    const nav = navRef.current;

    if (!nav) {
      return;
    }

    const items = nav.querySelectorAll<HTMLButtonElement>(".app-nav__item");
    const activeItem = items[activeIndex];

    if (!activeItem) {
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    const left = itemRect.left - navRect.left;

    setIndicatorStyle({
      width: `${itemRect.width}px`,
      left: `${left}px`
    });
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
    <nav className="app-nav app-glass" aria-label="Navegacao principal" ref={navRef}>
      <span
        className="app-nav__indicator"
        aria-hidden="true"
        style={{
          width: indicatorStyle.width,
          transform: `translateX(${indicatorStyle.left})`
        }}
      />
      {navItems.map((item, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            key={item.label}
            className={`app-nav__item${isActive ? " is-active" : ""}`}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => setActiveIndex(index)}
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
