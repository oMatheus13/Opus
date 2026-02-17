import { useEffect, useState } from "react";
import type { PreOnboardingData } from "../../utils/onboarding";
import { applyTheme, getInitialTheme } from "../../utils/theme";
import opusLogo from "../../assets/brand/opus-logotipo.svg";

type WelcomePageProps = {
  onComplete: (data: PreOnboardingData) => void;
  onExit?: () => void;
  showExit?: boolean;
};

const themeOptions = [
  {
    value: "light",
    label: "Claro",
    description: "Interface limpa e luminosa"
  },
  {
    value: "dark",
    label: "Escuro",
    description: "Mais foco e menos brilho"
  }
] as const;

const primaryLocales = [
  { country: "Brasil", currency: "BRL", label: "Brasil (R$)" },
  { country: "Estados Unidos", currency: "USD", label: "Estados Unidos ($)" },
  { country: "Zona do Euro", currency: "EUR", label: "Europa (€)" }
] as const;

const extraLocales = [
  { country: "Reino Unido", currency: "GBP", label: "Reino Unido (£)" },
  { country: "México", currency: "MXN", label: "México (MX$)" },
  { country: "Canadá", currency: "CAD", label: "Canadá (C$)" },
  { country: "Argentina", currency: "ARS", label: "Argentina ($)" },
  { country: "Chile", currency: "CLP", label: "Chile ($)" },
  { country: "Colômbia", currency: "COP", label: "Colômbia ($)" },
  { country: "Japão", currency: "JPY", label: "Japão (¥)" },
  { country: "Austrália", currency: "AUD", label: "Austrália (A$)" },
  { country: "Suíça", currency: "CHF", label: "Suíça (CHF)" }
] as const;

const objectiveOptions = [
  { value: "organizar", label: "Organizar minhas finanças" },
  { value: "economizar", label: "Economizar mais no mês" },
  { value: "investir", label: "Investir com consistência" },
  { value: "quitar-dividas", label: "Quitar dívidas" },
  { value: "planejar", label: "Planejar metas e sonhos" },
  { value: "controlar-gastos", label: "Controlar gastos diários" }
] as const;

const introCards = [
  {
    title: "Clareza total do seu dinheiro",
    description: "Entradas, saídas e transferências em um único lugar."
  },
  {
    title: "Organização por contas e categorias",
    description: "Entenda para onde seu dinheiro está indo."
  },
  {
    title: "Planejamento para metas reais",
    description: "Acompanhe objetivos sem perder o controle."
  }
] as const;

const WelcomePage = ({ onComplete, onExit, showExit = false }: WelcomePageProps) => {
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState(getInitialTheme);
  const [country, setCountry] = useState(primaryLocales[0].country);
  const [currency, setCurrency] = useState(primaryLocales[0].currency);
  const [objective, setObjective] = useState(objectiveOptions[0].value);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleLocaleSelect = (
    option: (typeof primaryLocales)[number] | (typeof extraLocales)[number]
  ) => {
    setCountry(option.country);
    setCurrency(option.currency);
  };

  const handleNext = () => {
    if (step < 3) {
      setStep((prev) => prev + 1);
      return;
    }

    onComplete({
      theme,
      country,
      currency,
      objective
    });
  };

  const handleBack = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <main className="welcome">
      <section className="welcome__panel">
        <header className="welcome__header">
          <div>
            <img className="welcome__logo" src={opusLogo} alt="Opus" />
            <p className="welcome__eyebrow">Boas-vindas</p>
            <h1 className="welcome__title">Bem-vindo ao Opus</h1>
            <p className="welcome__subtitle">
              Controle financeiro pessoal com clareza e organização.
            </p>
          </div>
          <div className="welcome__header-actions">
            {onExit && showExit ? (
              <button className="button button--ghost button--sm" type="button" onClick={onExit}>
                Voltar ao app
              </button>
            ) : null}
            <div className="welcome__steps" aria-hidden="true">
              <span className={`welcome__dot${step === 0 ? " is-active" : ""}`} />
              <span className={`welcome__dot${step === 1 ? " is-active" : ""}`} />
              <span className={`welcome__dot${step === 2 ? " is-active" : ""}`} />
              <span className={`welcome__dot${step === 3 ? " is-active" : ""}`} />
            </div>
          </div>
        </header>

        <div className="welcome__body">
          {step === 0 ? (
            <div className="welcome__section">
              <h2 className="welcome__section-title">Tudo o que importa no seu dinheiro.</h2>
              <p className="welcome__section-subtitle">
                Em poucos minutos você vai entender e organizar suas finanças.
              </p>
              <div className="welcome__intro-cards">
                {introCards.map((card) => (
                  <div className="welcome__intro-card" key={card.title}>
                    <strong>{card.title}</strong>
                    <span>{card.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="welcome__section">
              <h2 className="welcome__section-title">Qual tema combina com você?</h2>
              <p className="welcome__section-subtitle">
                Você pode trocar isso depois.
              </p>
              <div className="welcome__options">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`welcome__option${theme === option.value ? " is-active" : ""}`}
                    onClick={() => setTheme(option.value)}
                    aria-pressed={theme === option.value}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="welcome__section">
              <h2 className="welcome__section-title">Qual sua moeda principal?</h2>
              <p className="welcome__section-subtitle">
                Vamos usar isso para formatar valores.
              </p>
              <div className="welcome__options welcome__options--grid welcome__options--currency">
                {primaryLocales.map((option) => {
                  const isActive =
                    country === option.country && currency === option.currency;
                  return (
                    <button
                      key={`${option.country}-${option.currency}`}
                      type="button"
                      className={`welcome__option${isActive ? " is-active" : ""}`}
                      onClick={() => handleLocaleSelect(option)}
                      aria-pressed={isActive}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.currency}</span>
                    </button>
                  );
                })}
              </div>
              <details className="welcome__more">
                <summary>Outras moedas</summary>
                <div className="welcome__options welcome__options--grid welcome__options--currency">
                  {extraLocales.map((option) => {
                    const isActive =
                      country === option.country && currency === option.currency;
                    return (
                      <button
                        key={`${option.country}-${option.currency}`}
                        type="button"
                        className={`welcome__option${isActive ? " is-active" : ""}`}
                        onClick={() => handleLocaleSelect(option)}
                        aria-pressed={isActive}
                      >
                        <strong>{option.label}</strong>
                        <span>{option.currency}</span>
                      </button>
                    );
                  })}
                </div>
              </details>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="welcome__section">
              <h2 className="welcome__section-title">Qual seu objetivo principal?</h2>
              <p className="welcome__section-subtitle">
                Isso ajuda a personalizar os atalhos do app.
              </p>
              <div className="welcome__options welcome__options--grid">
                {objectiveOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`welcome__option${objective === option.value ? " is-active" : ""}`}
                    onClick={() => setObjective(option.value)}
                    aria-pressed={objective === option.value}
                  >
                    <strong>{option.label}</strong>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <footer className="welcome__footer">
          <button
            className={`button button--ghost${step === 0 ? " is-hidden" : ""}`}
            type="button"
            onClick={handleBack}
            disabled={step === 0}
          >
            Voltar
          </button>
          <button className="button button--primary" type="button" onClick={handleNext}>
            {step === 0 ? "Começar" : step === 3 ? "Continuar" : "Avançar"}
          </button>
        </footer>
      </section>
    </main>
  );
};

export default WelcomePage;
