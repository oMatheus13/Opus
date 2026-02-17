import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, PointerEvent } from "react";

import bancoDoBrasilLogo from "../../assets/instituicoes-brasileiras/bancos-publicos-federais/banco-do-brasil-logotipo.svg";
import caixaLogo from "../../assets/instituicoes-brasileiras/bancos-publicos-federais/caixa-logotipo.svg";
import bradescoLogo from "../../assets/instituicoes-brasileiras/maiores-bancos-privados/bradesco-logotipo.svg";
import santanderLogo from "../../assets/instituicoes-brasileiras/maiores-bancos-privados/santander-logotipo.svg";
import interLogo from "../../assets/instituicoes-brasileiras/bancos-100-digitais-e-fintechs/inter-logotipo.svg";
import c6Logo from "../../assets/instituicoes-brasileiras/bancos-100-digitais-e-fintechs/c6-logotipo.svg";

import visaLogo from "../../assets/instituicoes-brasileiras/cartoes-e-vouchers/visa-isotipo.svg";
import mastercardLogo from "../../assets/instituicoes-brasileiras/cartoes-e-vouchers/mastercard-isotipo.svg";
import eloLogo from "../../assets/instituicoes-brasileiras/cartoes-e-vouchers/elo-isotipo.svg";
import amexLogo from "../../assets/instituicoes-brasileiras/cartoes-e-vouchers/american-express-isotipo.svg";

type CardSkin = "aurora" | "ripple" | "stack";
type CardTone = "blue" | "olive" | "amber";

type BankOption = {
  id: string;
  label: string;
  short: string;
  logo: string;
};

type BrandOption = {
  id: string;
  label: string;
  logo: string;
};

type CreditCardItem = {
  id: string;
  bankId: string;
  brandId: string;
  limit: number;
  skin: CardSkin;
  tone: CardTone;
  last4: string;
};

const bankOptions: BankOption[] = [
  { id: "banco-do-brasil", label: "Banco do Brasil", short: "Banco do Brasil", logo: bancoDoBrasilLogo },
  { id: "caixa", label: "Caixa Econômica", short: "Caixa", logo: caixaLogo },
  { id: "bradesco", label: "Bradesco", short: "Bradesco", logo: bradescoLogo },
  { id: "santander", label: "Santander", short: "Santander", logo: santanderLogo },
  { id: "inter", label: "Banco Inter", short: "Inter", logo: interLogo },
  { id: "c6", label: "C6 Bank", short: "C6 Bank", logo: c6Logo }
];

const brandOptions: BrandOption[] = [
  { id: "visa", label: "Visa", logo: visaLogo },
  { id: "mastercard", label: "Mastercard", logo: mastercardLogo },
  { id: "elo", label: "Elo", logo: eloLogo },
  { id: "amex", label: "American Express", logo: amexLogo }
];

const skinOptions: Array<{ id: CardSkin; label: string }> = [
  { id: "aurora", label: "Aurora" },
  { id: "ripple", label: "Ripple" },
  { id: "stack", label: "Stack" }
];

const toneOptions: Array<{ id: CardTone; label: string }> = [
  { id: "blue", label: "Azul" },
  { id: "olive", label: "Oliva" },
  { id: "amber", label: "Âmbar" }
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);

const CreditCard = ({
  card,
  bank,
  brand,
  isPrimary,
  isTop,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel
}: {
  card: CreditCardItem;
  bank: BankOption;
  brand: BrandOption;
  isPrimary: boolean;
  isTop: boolean;
  onPointerDown?: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove?: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp?: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerCancel?: (event: PointerEvent<HTMLDivElement>) => void;
}) => {
  return (
    <div
      className={`credito__card credito__card--${isTop ? "top" : "back"} credito__card--skin-${
        card.skin
      } credito__card--tone-${card.tone}`}
      role="group"
      aria-label={`Cartão ${bank.label}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <div className="credito__card-header">
        <img className="credito__card-bank" src={bank.logo} alt={bank.label} />
        <img className="credito__card-brand" src={brand.logo} alt={brand.label} />
      </div>

      {isPrimary ? <span className="credito__card-tag">Cartão principal</span> : null}

      <div className="credito__card-body">
        <span className="credito__card-label">Limite total</span>
        <strong className="credito__card-value">{formatCurrency(card.limit)}</strong>
        <div className="credito__card-meta">
          <span>Uso atual</span>
          <span>{formatCurrency(0)}</span>
        </div>
      </div>

      <div className="credito__card-footer">
        <span className="credito__card-number">•••• {card.last4}</span>
        <span className="credito__card-bank-name">{bank.short}</span>
      </div>
    </div>
  );
};

const CreditoPage = () => {
  const [cards, setCards] = useState<CreditCardItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [bankId, setBankId] = useState(bankOptions[0].id);
  const [brandId, setBrandId] = useState(brandOptions[0].id);
  const [limit, setLimit] = useState("");
  const [skin, setSkin] = useState<CardSkin>(skinOptions[0].id);
  const [tone, setTone] = useState<CardTone>(toneOptions[0].id);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dragStartRef = useRef(0);
  const switchTimeoutRef = useRef<number | null>(null);

  const bankMap = useMemo(() => {
    return new Map(bankOptions.map((bank) => [bank.id, bank]));
  }, []);
  const brandMap = useMemo(() => {
    return new Map(brandOptions.map((brand) => [brand.id, brand]));
  }, []);

  const primaryCard = cards[0];
  const secondaryCard = cards[1];
  const canSwitch = cards.length > 1 && !isSwitching;

  useEffect(() => {
    return () => {
      if (switchTimeoutRef.current) {
        window.clearTimeout(switchTimeoutRef.current);
      }
    };
  }, []);

  const handleAddCard = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedLimit = Number(limit.replace(",", "."));
    const limitValue = Number.isFinite(parsedLimit) ? parsedLimit : 0;

    const newCard: CreditCardItem = {
      id: crypto.randomUUID(),
      bankId,
      brandId,
      limit: limitValue,
      skin,
      tone,
      last4: String(Math.floor(1000 + Math.random() * 9000))
    };

    setCards((prev) => [...prev, newCard]);
    setShowForm(false);
    setLimit("");
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!canSwitch) {
      return;
    }

    dragStartRef.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !canSwitch) {
      return;
    }

    const delta = Math.max(0, event.clientY - dragStartRef.current);
    setDragOffset(Math.min(delta, 120));
  };

  const resetDrag = () => {
    setDragOffset(0);
    setIsDragging(false);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);

    if (dragOffset < 70) {
      setDragOffset(0);
      return;
    }

    if (switchTimeoutRef.current) {
      window.clearTimeout(switchTimeoutRef.current);
    }

    setIsSwitching(true);
    setDragOffset(90);

    switchTimeoutRef.current = window.setTimeout(() => {
      setCards((prev) => {
        if (prev.length < 2) {
          return prev;
        }

        const [first, ...rest] = prev;
        return [...rest, first];
      });
      setDragOffset(0);
      setIsSwitching(false);
      switchTimeoutRef.current = null;
    }, 340);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    resetDrag();
  };

  const stackStyle = {
    "--card-drag-offset": `${dragOffset}px`
  } as CSSProperties;

  return (
    <section className="credito">
      <div className="credito__cards">
        <div className="credito__cards-header">
          <div>
            <p className="credito__eyebrow">Cartões de crédito</p>
            <p className="credito__hint">
              {cards.length > 1
                ? "Arraste para baixo e troque o cartão principal."
                : "Registre um cartão para começar."}
            </p>
          </div>
          <button
            className="button button--primary"
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
          >
            {cards.length ? "Registrar cartão" : "Adicionar cartão"}
          </button>
        </div>

        <div
          className={`credito__stack${isDragging ? " is-dragging" : ""}${
            isSwitching ? " is-switching" : ""
          }`}
          style={stackStyle}
        >
          {secondaryCard ? (
            <CreditCard
              card={secondaryCard}
              bank={bankMap.get(secondaryCard.bankId) ?? bankOptions[0]}
              brand={brandMap.get(secondaryCard.brandId) ?? brandOptions[0]}
              isPrimary={false}
              isTop={false}
            />
          ) : null}

          {primaryCard ? (
            <CreditCard
              card={primaryCard}
              bank={bankMap.get(primaryCard.bankId) ?? bankOptions[0]}
              brand={brandMap.get(primaryCard.brandId) ?? brandOptions[0]}
              isPrimary
              isTop
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            />
          ) : (
            <div className="credito__empty">
              <span>Registre seu primeiro cartão</span>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => setShowForm(true)}
              >
                Registrar cartão de crédito
              </button>
            </div>
          )}
        </div>

        <div className="credito__actions credito__actions--primary credito__actions--metaball">
          <div className="credito__actions-goo" aria-hidden="true">
            <span className="credito__action credito__action--ghost">
              <i className="fi fi-sr-arrow-down" aria-hidden="true" />
              Depósito
            </span>
            <span className="credito__action credito__action--ghost">
              <i className="fi fi-sr-arrow-up-right" aria-hidden="true" />
              Enviar
            </span>
            <span className="credito__action credito__action--icon credito__action--ghost">
              <i className="fi fi-sr-apps" aria-hidden="true" />
            </span>
          </div>
          <button className="credito__action" type="button">
            <i className="fi fi-sr-arrow-down" aria-hidden="true" />
            Depósito
          </button>
          <button className="credito__action" type="button">
            <i className="fi fi-sr-arrow-up-right" aria-hidden="true" />
            Enviar
          </button>
          <button
            className="credito__action credito__action--icon"
            type="button"
            aria-label="Mais opções"
          >
            <i className="fi fi-sr-apps" aria-hidden="true" />
          </button>
        </div>
      </div>

      {showForm ? (
        <section className="credito__register">
          <form className="form" onSubmit={handleAddCard}>
            <div className="form__row">
              <label className="form__group credito__group">
                <span className="form__label">Banco</span>
                <select
                  className="form__input credito__select"
                  value={bankId}
                  onChange={(event) => setBankId(event.target.value)}
                >
                  {bankOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form__group credito__group">
                <span className="form__label">Bandeira</span>
                <select
                  className="form__input credito__select"
                  value={brandId}
                  onChange={(event) => setBrandId(event.target.value)}
                >
                  {brandOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form__row">
              <label className="form__group credito__group">
                <span className="form__label">Limite de crédito</span>
                <input
                  className="form__input"
                  type="text"
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  value={limit}
                  onChange={(event) => setLimit(event.target.value)}
                />
              </label>

              <label className="form__group credito__group">
                <span className="form__label">Skin do cartão</span>
                <select
                  className="form__input credito__select"
                  value={skin}
                  onChange={(event) => setSkin(event.target.value as CardSkin)}
                >
                  {skinOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form__group credito__group">
                <span className="form__label">Cor</span>
                <select
                  className="form__input credito__select"
                  value={tone}
                  onChange={(event) => setTone(event.target.value as CardTone)}
                >
                  {toneOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form__actions">
              <button className="button button--primary" type="submit">
                Salvar cartão
              </button>
              <button
                className="button button--ghost"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </section>
  );
};

export default CreditoPage;
