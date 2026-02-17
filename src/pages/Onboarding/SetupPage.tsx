import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";
import { applyTheme } from "../../utils/theme";
import { readPreOnboarding } from "../../utils/onboarding";
import opusLogo from "../../assets/brand/opus-logotipo.svg";

type SetupPageProps = {
  onComplete?: () => void;
  onExit?: () => void;
  showExit?: boolean;
};

type CardItem = {
  name: string;
  limit: string;
};

type GoalOption = {
  id: string;
  label: string;
  hint: string;
  placeholder: string;
};

type GoalState = GoalOption & {
  selected: boolean;
  target: string;
};

const accountOptions = [
  "Principal",
  "Reserva",
  "Despesas fixas",
  "Lazer",
  "Investimentos"
];

const categoryOptions = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Lazer",
  "Assinaturas",
  "Educação",
  "Impostos",
  "Outros"
];

const goalOptions: GoalOption[] = [
  {
    id: "reserva",
    label: "Reserva de emergência",
    hint: "Monte um colchão de segurança.",
    placeholder: "Valor alvo (opcional)"
  },
  {
    id: "dividas",
    label: "Quitar dívidas",
    hint: "Organize e quite pendências.",
    placeholder: "Total a quitar (opcional)"
  },
  {
    id: "aportes",
    label: "Aporte mensal",
    hint: "Defina um valor recorrente.",
    placeholder: "Valor mensal (opcional)"
  }
];

const SetupPage = ({ onComplete, onExit, showExit = false }: SetupPageProps) => {
  const { updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const preOnboarding = useMemo(() => readPreOnboarding(), []);

  const [accounts, setAccounts] = useState<string[]>(() => accountOptions.slice(0, 3));
  const [accountInput, setAccountInput] = useState("");

  const [cards, setCards] = useState<CardItem[]>([]);
  const [cardName, setCardName] = useState("");
  const [cardLimit, setCardLimit] = useState("");

  const [categories, setCategories] = useState<string[]>(() => [...categoryOptions]);
  const [categoryInput, setCategoryInput] = useState("");

  const [goals, setGoals] = useState<GoalState[]>(() =>
    goalOptions.map((option) => ({
      ...option,
      selected: false,
      target: ""
    }))
  );

  const [wantsImport, setWantsImport] = useState(false);

  useEffect(() => {
    applyTheme(preOnboarding.theme);
  }, [preOnboarding.theme]);

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    handleFinish();
  };

  const handleBack = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const toggleItem = (list: string[], value: string, setter: (next: string[]) => void) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
      return;
    }

    setter([...list, value]);
  };

  const handleAddAccount = (event?: FormEvent) => {
    event?.preventDefault();
    const value = accountInput.trim();
    if (!value) {
      return;
    }

    if (accounts.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setAccountInput("");
      return;
    }

    setAccounts((prev) => [...prev, value]);
    setAccountInput("");
  };

  const handleAddCategory = (event?: FormEvent) => {
    event?.preventDefault();
    const value = categoryInput.trim();
    if (!value) {
      return;
    }

    if (categories.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setCategoryInput("");
      return;
    }

    setCategories((prev) => [...prev, value]);
    setCategoryInput("");
  };

  const handleAddCard = (event?: FormEvent) => {
    event?.preventDefault();
    const name = cardName.trim();
    if (!name) {
      return;
    }

    const limit = cardLimit.trim();
    setCards((prev) => [...prev, { name, limit }]);
    setCardName("");
    setCardLimit("");
  };

  const handleRemoveCard = (index: number) => {
    setCards((prev) => prev.filter((_, current) => current !== index));
  };

  const handleToggleGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id ? { ...goal, selected: !goal.selected } : goal
      )
    );
  };

  const handleGoalTarget = (id: string, value: string) => {
    setGoals((prev) =>
      prev.map((goal) => (goal.id === id ? { ...goal, target: value } : goal))
    );
  };

  const handleFinish = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

    const selectedGoals = goals
      .filter((goal) => goal.selected)
      .map((goal) => ({
        id: goal.id,
        label: goal.label,
        target: goal.target.trim() || null
      }));
    const normalizedCards = cards.map((card) => ({
      name: card.name,
      limit: card.limit.trim() || null
    }));

    const { error } = await updateUser({
      data: {
        theme: preOnboarding.theme,
        country: preOnboarding.country,
        currency: preOnboarding.currency,
        objective: preOnboarding.objective,
        setup_data: {
          accounts,
          cards: normalizedCards,
          categories,
          goals: selectedGoals,
          import_csv: wantsImport
        },
        setup_completed: true,
        setup_completed_at: new Date().toISOString()
      }
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    onComplete?.();
  };

  const selectedGoalLabels =
    goals.filter((goal) => goal.selected).map((goal) => goal.label) || [];

  return (
    <main className="setup">
      <section className="setup__panel">
        <header className="setup__header">
          <div>
            <img className="setup__logo" src={opusLogo} alt="Opus" />
            <p className="setup__eyebrow">Setup inicial</p>
            <h1 className="setup__title">Personalize o Opus para você</h1>
            <p className="setup__subtitle">
              Você pode ajustar essas escolhas depois.
            </p>
          </div>
          <div className="setup__header-actions">
            {onExit && showExit ? (
              <button className="button button--ghost button--sm" type="button" onClick={onExit}>
                Voltar ao app
              </button>
            ) : null}
            <div className="setup__steps" aria-hidden="true">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <span
                  key={`step-${index}`}
                  className={`setup__dot${step === index ? " is-active" : ""}`}
                />
              ))}
            </div>
          </div>
        </header>

        <div className="setup__body">
          {step === 0 ? (
            <div className="setup__section">
              <h2 className="setup__section-title">Crie suas contas principais</h2>
              <p className="setup__section-subtitle">
                Separe seu dinheiro em caixas do jeito que faz sentido.
              </p>
              <div className="setup__chips">
                {accountOptions.map((account) => (
                  <button
                    key={account}
                    type="button"
                    className={`setup__chip${accounts.includes(account) ? " is-active" : ""}`}
                    onClick={() => toggleItem(accounts, account, setAccounts)}
                    aria-pressed={accounts.includes(account)}
                  >
                    {account}
                  </button>
                ))}
              </div>
              <form className="setup__inline" onSubmit={handleAddAccount}>
                <input
                  className="setup__input"
                  type="text"
                  placeholder="Adicionar conta"
                  value={accountInput}
                  onChange={(event) => setAccountInput(event.target.value)}
                />
                <button className="button button--ghost button--sm" type="submit">
                  Adicionar
                </button>
              </form>
              {accounts.length ? (
                <p className="setup__hint">
                  Selecionadas: {accounts.join(", ")}.
                </p>
              ) : (
                <p className="setup__hint">Escolha ao menos uma conta.</p>
              )}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="setup__section">
              <h2 className="setup__section-title">Adicione seus cartões</h2>
              <p className="setup__section-subtitle">
                Informe o nome e o limite para acompanhar o crédito.
              </p>
              <form className="setup__inline setup__inline--grid" onSubmit={handleAddCard}>
                <input
                  className="setup__input"
                  type="text"
                  placeholder="Nome do cartão"
                  value={cardName}
                  onChange={(event) => setCardName(event.target.value)}
                />
                <input
                  className="setup__input"
                  type="number"
                  inputMode="decimal"
                  placeholder="Limite"
                  value={cardLimit}
                  onChange={(event) => setCardLimit(event.target.value)}
                />
                <button className="button button--ghost button--sm" type="submit">
                  Adicionar
                </button>
              </form>
              {cards.length ? (
                <div className="setup__list">
                  {cards.map((card, index) => (
                    <div className="setup__list-item" key={`${card.name}-${index}`}>
                      <div>
                        <strong>{card.name}</strong>
                        {card.limit ? <span>Limite: {card.limit}</span> : null}
                      </div>
                      <button
                        className="setup__remove"
                        type="button"
                        onClick={() => handleRemoveCard(index)}
                        aria-label={`Remover cartão ${card.name}`}
                      >
                        <i className="fi fi-sr-cross" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="setup__hint">Nenhum cartão adicionado.</p>
              )}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="setup__section">
              <h2 className="setup__section-title">Categorias base</h2>
              <p className="setup__section-subtitle">
                Selecione as categorias que mais usa.
              </p>
              <div className="setup__chips">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`setup__chip${categories.includes(category) ? " is-active" : ""}`}
                    onClick={() => toggleItem(categories, category, setCategories)}
                    aria-pressed={categories.includes(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <form className="setup__inline" onSubmit={handleAddCategory}>
                <input
                  className="setup__input"
                  type="text"
                  placeholder="Adicionar categoria"
                  value={categoryInput}
                  onChange={(event) => setCategoryInput(event.target.value)}
                />
                <button className="button button--ghost button--sm" type="submit">
                  Adicionar
                </button>
              </form>
              {categories.length ? (
                <p className="setup__hint">
                  Selecionadas: {categories.join(", ")}.
                </p>
              ) : (
                <p className="setup__hint">Escolha ao menos uma categoria.</p>
              )}
            </div>
          ) : null}

          {step === 3 ? (
            <div className="setup__section">
              <h2 className="setup__section-title">Metas iniciais</h2>
              <p className="setup__section-subtitle">
                Configure objetivos simples para acompanhar desde o início.
              </p>
              <div className="setup__goals">
                {goals.map((goal) => (
                  <div className="setup__goal" key={goal.id}>
                    <button
                      className={`setup__goal-toggle${goal.selected ? " is-active" : ""}`}
                      type="button"
                      onClick={() => handleToggleGoal(goal.id)}
                      aria-pressed={goal.selected}
                    >
                      <strong>{goal.label}</strong>
                      <span>{goal.hint}</span>
                    </button>
                    {goal.selected ? (
                      <input
                        className="setup__input"
                        type="text"
                        placeholder={goal.placeholder}
                        value={goal.target}
                        onChange={(event) => handleGoalTarget(goal.id, event.target.value)}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="setup__section">
              <h2 className="setup__section-title">Importar dados</h2>
              <p className="setup__section-subtitle">
                Se quiser, você pode trazer um CSV depois.
              </p>
              <div className="setup__options">
                <button
                  className={`setup__option${wantsImport ? " is-active" : ""}`}
                  type="button"
                  onClick={() => setWantsImport(true)}
                  aria-pressed={wantsImport}
                >
                  <strong>Quero importar um CSV</strong>
                  <span>Disponível em breve.</span>
                </button>
                <button
                  className={`setup__option${!wantsImport ? " is-active" : ""}`}
                  type="button"
                  onClick={() => setWantsImport(false)}
                  aria-pressed={!wantsImport}
                >
                  <strong>Vou adicionar manualmente</strong>
                  <span>Posso fazer isso depois.</span>
                </button>
              </div>

              <div className="setup__summary">
                <div className="setup__item">
                  <span>Contas</span>
                  <strong>{accounts.length ? accounts.join(", ") : "Nenhuma"}</strong>
                </div>
                <div className="setup__item">
                  <span>Cartões</span>
                  <strong>{cards.length ? cards.map((card) => card.name).join(", ") : "Nenhum"}</strong>
                </div>
                <div className="setup__item">
                  <span>Categorias</span>
                  <strong>{categories.length ? categories.join(", ") : "Nenhuma"}</strong>
                </div>
                <div className="setup__item">
                  <span>Metas</span>
                  <strong>
                    {selectedGoalLabels.length ? selectedGoalLabels.join(", ") : "Nenhuma"}
                  </strong>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {errorMessage ? (
          <p className="setup__status" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <footer className="setup__footer">
          <button
            className={`button button--ghost${step === 0 ? " is-hidden" : ""}`}
            type="button"
            onClick={handleBack}
            disabled={step === 0}
          >
            Voltar
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {step === totalSteps - 1
              ? isSubmitting
                ? "Finalizando..."
                : "Concluir setup"
              : "Avançar"}
          </button>
        </footer>
      </section>
    </main>
  );
};

export default SetupPage;
