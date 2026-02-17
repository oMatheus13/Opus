import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, MouseEvent, PointerEvent, TouchEvent } from "react";

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
type CardStatus = "ok" | "late";

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
  used: number;
  skin: CardSkin;
  tone: CardTone;
  name: string;
  status: CardStatus;
};

type CarouselItem = { kind: "card"; card: CreditCardItem } | { kind: "empty" };

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

const formatLimitInput = (value: number) => {
  if (!Number.isFinite(value) || value === 0) {
    return "";
  }

  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const parseLimitValue = (value: string) => {
  const normalized = value
    .trim()
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const CreditCard = ({
  card,
  bank,
  brand,
  isPrimary
}: {
  card: CreditCardItem;
  bank: BankOption;
  brand: BrandOption;
  isPrimary: boolean;
}) => {
  const tags = [card.status === "late" ? "Em atraso" : "Em dia"];

  if (isPrimary) {
    tags.unshift("Cartão principal");
  }

  return (
    <div
      className={`credito__card credito__card--skin-${card.skin} credito__card--tone-${card.tone}`}
      role="group"
      aria-label={`Cartão ${bank.label}`}
    >
      <div className="credito__card-bank">
        <img src={bank.logo} alt={bank.label} />
      </div>

      <div className="credito__card-tags">
        {tags.map((tag) => (
          <span key={tag} className="credito__card-tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="credito__card-info">
        <span className="credito__card-label">Limite total</span>
        <strong className="credito__card-value">{formatCurrency(card.limit)}</strong>
        <span className="credito__card-usage">
          Uso atual <span>{formatCurrency(card.used)}</span>
        </span>
      </div>

      <span className="credito__card-name">{card.name}</span>

      <div className="credito__card-brand">
        <img src={brand.logo} alt={brand.label} />
      </div>
    </div>
  );
};

const CreditoPage = () => {
  const [cards, setCards] = useState<CreditCardItem[]>([]);
  const [draftBankId, setDraftBankId] = useState(bankOptions[0].id);
  const [draftBrandId, setDraftBrandId] = useState(brandOptions[0].id);
  const [draftLimit, setDraftLimit] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftSkin, setDraftSkin] = useState<CardSkin>(skinOptions[0].id);
  const [draftTone, setDraftTone] = useState<CardTone>(toneOptions[0].id);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalActive, setIsModalActive] = useState(false);
  const [modalOrigin, setModalOrigin] = useState<DOMRect | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragMovedRef = useRef(false);
  const switchTimeoutRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const bankMap = useMemo(() => {
    return new Map(bankOptions.map((bank) => [bank.id, bank]));
  }, []);
  const brandMap = useMemo(() => {
    return new Map(brandOptions.map((brand) => [brand.id, brand]));
  }, []);

  const carouselItems = useMemo<CarouselItem[]>(() => {
    return [...cards.map((card) => ({ kind: "card", card } as const)), { kind: "empty" }];
  }, [cards]);
  const totalItems = carouselItems.length;
  const canSwitch = totalItems > 1 && !isSwitching;

  const draftBank = bankMap.get(draftBankId) ?? bankOptions[0];
  const draftBrand = brandMap.get(draftBrandId) ?? brandOptions[0];
  const editingCard = editingId ? cards.find((card) => card.id === editingId) ?? null : null;
  const modalUsed = editingCard?.used ?? 0;
  const safeIndex =
    totalItems > 0 ? ((activeIndex % totalItems) + totalItems) % totalItems : 0;
  const activeItem = carouselItems[safeIndex];
  const getItemAt = (index: number) => carouselItems[(index + totalItems) % totalItems];
  const otherCount = totalItems - 1;
  const desiredSide = isHorizontal ? 2 : 1;
  const perSide = otherCount >= desiredSide * 2 ? desiredSide : otherCount >= 2 ? 1 : 0;
  const prevCount = otherCount >= 2 ? perSide : 0;
  const nextCount = otherCount === 1 ? 1 : perSide;
  const prevItems = Array.from({ length: prevCount }, (_, index) => ({
    item: getItemAt(safeIndex - (index + 1)),
    depth: index + 1
  }));
  const nextItems = Array.from({ length: nextCount }, (_, index) => ({
    item: getItemAt(safeIndex + (index + 1)),
    depth: index + 1
  }));

  useEffect(() => {
    if (activeIndex !== safeIndex) {
      setActiveIndex(safeIndex);
    }
  }, [activeIndex, safeIndex]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(min-width: 900px)");
    const handleChange = () => setIsHorizontal(media.matches);

    handleChange();
    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    return () => {
      if (switchTimeoutRef.current) {
        window.clearTimeout(switchTimeoutRef.current);
      }
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isModalVisible) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalVisible]);

  const openEditor = (rect: DOMRect, card: CreditCardItem | null) => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    setModalOrigin(rect);

    if (card) {
      setEditingId(card.id);
      setDraftBankId(card.bankId);
      setDraftBrandId(card.brandId);
      setDraftLimit(formatLimitInput(card.limit));
      setDraftName(card.name);
      setDraftSkin(card.skin);
      setDraftTone(card.tone);
    } else {
      setEditingId(null);
      setDraftBankId(bankOptions[0].id);
      setDraftBrandId(brandOptions[0].id);
      setDraftLimit("");
      setDraftName("");
      setDraftSkin(skinOptions[0].id);
      setDraftTone(toneOptions[0].id);
    }

    setIsModalVisible(true);
    requestAnimationFrame(() => setIsModalActive(true));
  };

  const handleCloseModal = () => {
    setIsModalActive(false);

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      setIsModalVisible(false);
      setModalOrigin(null);
      setEditingId(null);
      closeTimeoutRef.current = null;
    }, 260);
  };

  const saveCard = () => {
    if (!editingId && !draftLimit.trim() && !draftName.trim()) {
      return;
    }

    const limitValue = parseLimitValue(draftLimit);
    const fallbackName = "Cartão";
    const nextCard: CreditCardItem = {
      id: editingId ?? crypto.randomUUID(),
      bankId: draftBankId,
      brandId: draftBrandId,
      limit: limitValue,
      used: editingId ? editingCard?.used ?? 0 : 0,
      skin: draftSkin,
      tone: draftTone,
      name: draftName.trim() || fallbackName,
      status: editingId ? editingCard?.status ?? "ok" : "ok"
    };

    setCards((prev) => {
      if (editingId) {
        return prev.map((card) => (card.id === editingId ? nextCard : card));
      }

      return [...prev, nextCard];
    });

    if (!editingId) {
      setActiveIndex(cards.length);
    }
  };

  const handleSaveCard = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveCard();
    handleCloseModal();
  };

  const handleConfirm = (
    event: MouseEvent<HTMLButtonElement> | PointerEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const form = document.getElementById("credito-modal-form") as HTMLFormElement | null;
    form?.requestSubmit();
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    dragMovedRef.current = false;
    if (!canSwitch) {
      return;
    }

    dragStartRef.current = { x: event.clientX, y: event.clientY };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!isDragging || !canSwitch) {
      return;
    }

    const delta = isHorizontal
      ? event.clientX - dragStartRef.current.x
      : event.clientY - dragStartRef.current.y;
    const movement = Math.abs(delta);

    if (movement > 6) {
      dragMovedRef.current = true;
    }

    const clamped = Math.max(-120, Math.min(delta, 120));
    setDragOffset(clamped);
  };

  const resetDrag = () => {
    setDragOffset(0);
    setIsDragging(false);
  };

  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);

    if (Math.abs(dragOffset) < 70) {
      setDragOffset(0);
      return;
    }

    if (switchTimeoutRef.current) {
      window.clearTimeout(switchTimeoutRef.current);
    }

    const direction = dragOffset > 0 ? 1 : -1;
    if (totalItems <= 1) {
      setDragOffset(0);
      return;
    }

    setIsSwitching(true);
    setDragOffset(90 * direction);

    switchTimeoutRef.current = window.setTimeout(() => {
      setActiveIndex((prev) => (prev + direction + totalItems) % totalItems);
      setDragOffset(0);
      setIsSwitching(false);
      switchTimeoutRef.current = null;
    }, 340);
  };

  const handlePointerCancel = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    resetDrag();
  };

  const stackStyle = {
    "--card-drag-offset": `${dragOffset}px`
  } as CSSProperties;

  const stackClassName = [
    "credito__stack",
    isDragging ? "is-dragging" : "",
    isSwitching ? "is-switching" : "",
    isHorizontal ? "is-horizontal" : "is-vertical"
  ]
    .filter(Boolean)
    .join(" ");

  const modalStyle = modalOrigin
    ? ({
        "--modal-origin-x": `${modalOrigin.left}px`,
        "--modal-origin-y": `${modalOrigin.top}px`,
        "--modal-origin-width": `${modalOrigin.width}px`,
        "--modal-origin-height": `${modalOrigin.height}px`
      } as CSSProperties)
    : undefined;

  const renderItemContent = (item: CarouselItem) => {
    if (item.kind === "card") {
      const isPrimary = cards[0]?.id === item.card.id;
      return (
        <CreditCard
          card={item.card}
          bank={bankMap.get(item.card.bankId) ?? bankOptions[0]}
          brand={brandMap.get(item.card.brandId) ?? brandOptions[0]}
          isPrimary={isPrimary}
        />
      );
    }

    return (
      <div className="credito__card credito__card--empty">
        <div className="credito__card-empty">
          <i className="fi fi-sr-plus" aria-hidden="true" />
          <span>Novo cartão</span>
        </div>
      </div>
    );
  };

  const handleActiveClick = (item: CarouselItem, event: MouseEvent<HTMLButtonElement>) => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    openEditor(rect, item.kind === "card" ? item.card : null);
  };

  const renderActiveItem = (item: CarouselItem) => (
    <button
      className="credito__card-wrap credito__card-wrap--active credito__card-wrap--clickable"
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={(event) => handleActiveClick(item, event)}
    >
      {renderItemContent(item)}
    </button>
  );

  const renderSideItem = (
    item: CarouselItem,
    position: "prev" | "next",
    depth: number
  ) => {
    const scale = Math.max(0.88, 1 - depth * 0.03);
    const opacity = Math.max(0.78, 1 - depth * 0.04);

    return (
      <div
        className={`credito__card-wrap credito__card-wrap--${position}`}
        style={
          {
            "--stack-depth": `${depth}`,
            "--stack-scale": `${scale}`,
            "--stack-opacity": `${opacity}`,
            zIndex: 2 - depth
          } as CSSProperties
        }
        aria-hidden="true"
      >
        {renderItemContent(item)}
      </div>
    );
  };

  return (
    <section className="credito">
      <div className="credito__cards">
        <div className={stackClassName} style={stackStyle}>
          {prevItems.map(({ item, depth }) => renderSideItem(item, "prev", depth))}
          {nextItems.map(({ item, depth }) => renderSideItem(item, "next", depth))}
          {activeItem ? renderActiveItem(activeItem) : null}
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

      {isModalVisible ? (
        <div className={`credito__modal${isModalActive ? " is-open" : ""}`} onClick={handleCloseModal}>
          <form
            id="credito-modal-form"
            className={`credito__modal-card credito__card credito__card--skin-${draftSkin} credito__card--tone-${draftTone}${
              isModalActive ? " is-open" : ""
            }`}
            onSubmit={handleSaveCard}
            onClick={(event) => event.stopPropagation()}
            style={modalStyle}
            role="dialog"
            aria-modal="true"
          >
            <div className="credito__card-bank credito__card-bank--edit">
              <img src={draftBank.logo} alt={draftBank.label} />
              <select
                className="credito__card-select credito__card-select--overlay"
                value={draftBankId}
                onChange={(event) => setDraftBankId(event.target.value)}
                aria-label="Selecionar banco"
              >
                {bankOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="credito__card-info">
              <span className="credito__card-label">Limite total</span>
              <input
                className="credito__card-input"
                type="text"
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={draftLimit}
                onChange={(event) => setDraftLimit(event.target.value)}
              />
              <span className="credito__card-usage">
                Uso atual <span>{formatCurrency(modalUsed)}</span>
              </span>
            </div>

            <input
              className="credito__card-name-input"
              type="text"
              placeholder="Nome do cartão"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
            />

            <div className="credito__card-brand credito__card-brand--edit">
              <img src={draftBrand.logo} alt={draftBrand.label} />
              <select
                className="credito__card-select credito__card-select--overlay"
                value={draftBrandId}
                onChange={(event) => setDraftBrandId(event.target.value)}
                aria-label="Selecionar bandeira"
              >
                {brandOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </form>
          <div
            className={`credito__modal-actions${isModalActive ? " is-open" : ""}`}
            onClick={(event) => event.stopPropagation()}
          >
            <label className="credito__action credito__action--select">
              <span className="credito__action-label">Skin</span>
              <span className="credito__action-value">
                {skinOptions.find((option) => option.id === draftSkin)?.label ?? "Skin"}
              </span>
              <select
                className="credito__action-select"
                value={draftSkin}
                onChange={(event) => setDraftSkin(event.target.value as CardSkin)}
                aria-label="Selecionar skin"
              >
                {skinOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="credito__action credito__action--select">
              <span className="credito__action-label">Cor</span>
              <span className="credito__action-value">
                {toneOptions.find((option) => option.id === draftTone)?.label ?? "Cor"}
              </span>
              <select
                className="credito__action-select"
                value={draftTone}
                onChange={(event) => setDraftTone(event.target.value as CardTone)}
                aria-label="Selecionar cor"
              >
                {toneOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="credito__action credito__action--icon credito__action--confirm"
              type="button"
              aria-label="Salvar cartão"
              onClick={handleConfirm}
              onPointerUp={handleConfirm}
              onTouchEnd={handleConfirm}
            >
              <i className="fi fi-sr-check" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default CreditoPage;
