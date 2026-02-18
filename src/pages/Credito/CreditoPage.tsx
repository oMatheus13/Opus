import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, MouseEvent, PointerEvent } from "react";

type CardSkin = "aurora" | "ripple" | "stack";
type CardTone = "blue" | "olive" | "amber";
type CardStatus = "ok" | "late";

type BankOption = {
  id: string;
  label: string;
  logo: string;
  slug: string;
  category: string;
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
type InvoiceRecord = {
  id: string;
  cardId: string;
  month: number;
  year: number;
  total: number;
  closingDay: number;
  dueDay: number;
};

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\+/g, "plus")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const toTitleCase = (value: string) => {
  const lowerWords = new Set(["de", "da", "do", "das", "dos", "e"]);
  return value
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (lowerWords.has(lower) && index > 0) {
        return lower;
      }
      if (/\d/.test(word) || word.length <= 2) {
        return word.toUpperCase();
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
};

const bankLabelOverrides: Record<string, string> = {
  "banco-do-brasil": "Banco do Brasil",
  caixa: "Caixa Econômica",
  itau: "Itaú",
  bradesco: "Bradesco",
  santander: "Santander",
  nu: "Nubank",
  inter: "Banco Inter",
  c6: "C6 Bank",
  "btg-pactual": "BTG Pactual",
  safra: "Safra"
};

const brandLabelOverrides: Record<string, string> = {
  "american-express": "American Express",
  "diners-club-international": "Diners Club",
  "google-pay": "Google Pay",
  "apple-pay": "Apple Pay",
  "samsung-pay": "Samsung Pay"
};

const bankLogoModules = {
  ...import.meta.glob(
    "../../assets/instituicoes-brasileiras/associacao-de-poupanca-e-emprestimo/**/*isotipo-bg.svg",
    { eager: true, import: "default" }
  ),
  ...import.meta.glob(
    "../../assets/instituicoes-brasileiras/bancos-100-digitais-e-fintechs/**/*isotipo-bg.svg",
    { eager: true, import: "default" }
  ),
  ...import.meta.glob(
    "../../assets/instituicoes-brasileiras/bancos-estrangeiros-com-atuacao-nacional/**/*isotipo-bg.svg",
    { eager: true, import: "default" }
  ),
  ...import.meta.glob(
    "../../assets/instituicoes-brasileiras/bancos-publicos-federais/**/*isotipo-bg.svg",
    { eager: true, import: "default" }
  ),
  ...import.meta.glob(
    "../../assets/instituicoes-brasileiras/bancos-publicos-regionais/**/*isotipo-bg.svg",
    { eager: true, import: "default" }
  ),
  ...import.meta.glob(
    "../../assets/instituicoes-brasileiras/cooperativas-de-credito/**/*isotipo-bg.svg",
    { eager: true, import: "default" }
  ),
  ...import.meta.glob(
    "../../assets/instituicoes-brasileiras/maiores-bancos-privados/**/*isotipo-bg.svg",
    { eager: true, import: "default" }
  ),
  ...import.meta.glob(
    "../../assets/instituicoes-brasileiras/outros-bancos/**/*isotipo-bg.svg",
    { eager: true, import: "default" }
  ),
  ...import.meta.glob(
    "../../assets/instituicoes-brasileiras/subsidiaria-financeira/**/*isotipo-bg.svg",
    { eager: true, import: "default" }
  )
} as Record<string, string>;

const brandLogoModules = import.meta.glob(
  "../../assets/instituicoes-brasileiras/cartoes-e-vouchers/*isotipo.svg",
  { eager: true, import: "default" }
) as Record<string, string>;

const buildOptions = <T extends { id: string; label: string }>(items: T[]) =>
  items.sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));

const bankOptions: BankOption[] = buildOptions(
  Object.entries(bankLogoModules).map(([path, logo]) => {
    const parts = path.split("/");
    const baseIndex = parts.lastIndexOf("instituicoes-brasileiras");
    const category = baseIndex >= 0 ? parts[baseIndex + 1] : "bancos";
    const fileName = parts[parts.length - 1] ?? "";
    const slugBase = fileName.replace("-isotipo-bg.svg", "");
    const slug = slugify(slugBase);
    const label = bankLabelOverrides[slug] ?? toTitleCase(slugBase);
    return {
      id: `${category}--${slug}`,
      label,
      logo,
      slug,
      category
    };
  })
);

const allowedCardBrandSlugs = new Set([
  "visa",
  "mastercard",
  "elo",
  "american-express",
  "diners-club-international",
  "hipercard",
  "hiper"
]);

const brandOptions: BrandOption[] = buildOptions(
  Object.entries(brandLogoModules)
    .map(([path, logo]) => {
      const fileName = path.split("/").pop() ?? "";
      const slugBase = fileName.replace("-isotipo.svg", "");
      const slug = slugify(slugBase);
      const label = brandLabelOverrides[slug] ?? toTitleCase(slugBase);
      return {
        id: slug,
        label,
        logo
      };
    })
    .filter((option) => allowedCardBrandSlugs.has(option.id))
);

const featuredBankSlugs = [
  "banco-do-brasil",
  "caixa",
  "itau",
  "bradesco",
  "santander",
  "nu",
  "inter",
  "c6",
  "btg-pactual",
  "safra"
];

const featuredBankOptions: BankOption[] = featuredBankSlugs
  .map((slug) => bankOptions.find((option) => option.slug === slug))
  .filter((option): option is BankOption => Boolean(option));

const previewBankOptions = featuredBankOptions.slice(0, 6);

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

const formatCurrencyParts = (value: number) => {
  const parts = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).formatToParts(value);
  let sign = "";
  let currency = "";
  let integer = "";
  let decimal = "";
  let fraction = "";

  parts.forEach((part) => {
    if (part.type === "minusSign") {
      sign = part.value;
    }
    if (part.type === "currency") {
      currency = part.value;
    }
    if (part.type === "integer" || part.type === "group") {
      integer += part.value;
    }
    if (part.type === "decimal") {
      decimal = part.value;
    }
    if (part.type === "fraction") {
      fraction = part.value;
    }
  });

  return { sign, currency, integer, decimal, fraction };
};

const formatMonthLabel = (month: number, year: number) => {
  const date = new Date(year, month, 1);
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric"
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
};

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

const CurrencyValue = ({ value }: { value: number }) => {
  const { sign, currency, integer, decimal, fraction } = formatCurrencyParts(value);
  return (
    <span className="credito__currency">
      {sign ? <span className="credito__currency-sign">{sign}</span> : null}
      <span className="credito__currency-prefix">{currency}</span>
      <span className="credito__currency-main">{integer}</span>
      <span className="credito__currency-decimal">
        {decimal}
        {fraction}
      </span>
    </span>
  );
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
        <strong className="credito__card-value">
          <CurrencyValue value={card.limit} />
        </strong>
        <span className="credito__card-usage">
          Uso atual{" "}
          <span className="credito__card-usage-value">
            <CurrencyValue value={card.used} />
          </span>
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
  const [draftBankId, setDraftBankId] = useState(
    featuredBankOptions[0]?.id ?? bankOptions[0]?.id ?? ""
  );
  const [draftBrandId, setDraftBrandId] = useState(brandOptions[0]?.id ?? "");
  const [draftLimit, setDraftLimit] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftSkin, setDraftSkin] = useState<CardSkin>(skinOptions[0].id);
  const [draftTone, setDraftTone] = useState<CardTone>(toneOptions[0].id);
  const [bankQuery, setBankQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceCardId, setInvoiceCardId] = useState("");
  const [invoiceTotalInput, setInvoiceTotalInput] = useState("");
  const [invoiceClosingDay, setInvoiceClosingDay] = useState("10");
  const [invoiceDueDay, setInvoiceDueDay] = useState("18");
  const [invoiceMonthsAhead, setInvoiceMonthsAhead] = useState("2");
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalActive, setIsModalActive] = useState(false);
  const [isBankPickerOpen, setIsBankPickerOpen] = useState(false);
  const [isBrandPickerOpen, setIsBrandPickerOpen] = useState(false);
  const [modalOrigin, setModalOrigin] = useState<DOMRect | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [cardMetrics, setCardMetrics] = useState({ width: 280, gap: 20, spacing: 300 });
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
  const normalizedBankQuery = bankQuery.trim().toLowerCase();
  const filteredBankOptions = useMemo(() => {
    if (!normalizedBankQuery) {
      return [];
    }

    return bankOptions.filter((option) => {
      const haystack = `${option.label} ${option.slug} ${option.category}`.toLowerCase();
      return haystack.includes(normalizedBankQuery);
    });
  }, [normalizedBankQuery]);

  const totalCards = cards.length;
  const emptyIndex = totalCards;
  const carouselItems = useMemo<CarouselItem[]>(() => {
    return [...cards.map((card) => ({ kind: "card", card } as const)), { kind: "empty" }];
  }, [cards]);
  const totalSlots = carouselItems.length;
  const canSwitch = totalSlots > 1 && !isSwitching;

  const fallbackBank =
    bankOptions[0] ??
    ({ id: "banco", label: "Banco", logo: "", slug: "banco", category: "bancos" } as BankOption);
  const fallbackBrand = brandOptions[0] ?? ({ id: "visa", label: "Visa", logo: "" } as BrandOption);
  const draftBank = bankMap.get(draftBankId) ?? fallbackBank;
  const draftBrand = brandMap.get(draftBrandId) ?? fallbackBrand;
  const editingCard = editingId ? cards.find((card) => card.id === editingId) ?? null : null;
  const modalUsed = editingCard?.used ?? 0;
  const normalizeIndex = (index: number) => {
    if (totalCards === 0) {
      return 0;
    }

    return Math.min(Math.max(index, 0), emptyIndex);
  };

  const activeSlotIndex = normalizeIndex(activeIndex);

  const getItemAt = (index: number): CarouselItem =>
    index === emptyIndex ? { kind: "empty" } : { kind: "card", card: cards[index] };

  const activeItem = totalSlots > 0 ? getItemAt(activeSlotIndex) : null;
  const activeInvoiceCard =
    activeItem?.kind === "card" ? activeItem.card : cards[0] ?? null;
  const activeInvoiceBank = activeInvoiceCard
    ? bankMap.get(activeInvoiceCard.bankId)
    : null;
  const activeCardId = activeInvoiceCard?.id ?? "";
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const activeInvoices = useMemo(() => {
    if (!activeCardId) {
      return [];
    }

    return invoices
      .filter((invoice) => invoice.cardId === activeCardId)
      .sort((a, b) => (a.year - b.year) || (a.month - b.month));
  }, [activeCardId, invoices]);
  const currentInvoiceIndex = activeInvoices.findIndex(
    (invoice) => invoice.month === currentMonth && invoice.year === currentYear
  );
  const currentInvoice =
    currentInvoiceIndex >= 0
      ? activeInvoices[currentInvoiceIndex]
      : activeInvoices[0] ?? null;
  const projectionInvoices =
    activeInvoices.length > 0
      ? activeInvoices.slice(currentInvoiceIndex >= 0 ? currentInvoiceIndex + 1 : 1, 4)
      : [];
  const invoiceTotalAmount = currentInvoice?.total ?? 0;
  const closingDay = currentInvoice?.closingDay ?? 0;
  const dueDay = currentInvoice?.dueDay ?? 0;
  const invoiceAvailable = Math.max(0, (activeInvoiceCard?.limit ?? 0) - invoiceTotalAmount);
  const invoiceUsagePercent =
    activeInvoiceCard?.limit && activeInvoiceCard.limit > 0
      ? Math.min(100, (invoiceTotalAmount / activeInvoiceCard.limit) * 100)
      : 0;
  const hasInvoice = Boolean(currentInvoice);

  const stepNextIndex = (index: number, wrap = true) => {
    if (totalSlots <= 1) {
      return 0;
    }

    if (!wrap) {
      return Math.min(index + 1, emptyIndex);
    }

    return (index + 1 + totalSlots) % totalSlots;
  };

  const stepPrevIndex = (index: number, wrap = true) => {
    if (totalSlots <= 1) {
      return 0;
    }

    if (!wrap) {
      return Math.max(index - 1, 0);
    }

    return (index - 1 + totalSlots) % totalSlots;
  };

  const maxDepth = isHorizontal ? 3 : 1;
  const availableSlots = Math.max(0, totalSlots - 1);
  const perSide = Math.min(maxDepth, Math.floor(availableSlots / 2));
  const prevCount = perSide;
  const nextCount = availableSlots > 0 ? Math.min(maxDepth, availableSlots - prevCount) : 0;

  const prevItems: Array<{ item: CarouselItem; depth: number }> = [];
  const nextItems: Array<{ item: CarouselItem; depth: number }> = [];

  if (availableSlots > 0) {
    let prevCursor = activeSlotIndex;
    for (let depth = 1; depth <= prevCount; depth += 1) {
      prevCursor = stepPrevIndex(prevCursor);
      if (prevCursor === activeSlotIndex) {
        break;
      }
      prevItems.push({ item: getItemAt(prevCursor), depth });
    }

    let nextCursor = activeSlotIndex;
    for (let depth = 1; depth <= nextCount; depth += 1) {
      nextCursor = stepNextIndex(nextCursor);
      if (nextCursor === activeSlotIndex) {
        break;
      }
      nextItems.push({ item: getItemAt(nextCursor), depth });
    }
  }

  useEffect(() => {
    setActiveIndex((prev) => normalizeIndex(prev));
  }, [totalCards, emptyIndex]);

  useEffect(() => {
    if (!invoiceCardId && cards[0]) {
      setInvoiceCardId(cards[0].id);
    }
  }, [cards, invoiceCardId]);

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
    if (!isHorizontal || typeof window === "undefined") {
      return;
    }

    const updateMetrics = () => {
      const width = Math.min(320, Math.max(220, window.innerWidth * 0.22));
      const gap = Math.min(24, Math.max(10, window.innerWidth * 0.012));
      const spacing = Math.round(width * 0.8);
      setCardMetrics({ width, gap, spacing });
    };

    updateMetrics();
    window.addEventListener("resize", updateMetrics);

    return () => window.removeEventListener("resize", updateMetrics);
  }, [isHorizontal]);

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
        if (isBankPickerOpen || isBrandPickerOpen) {
          setIsBankPickerOpen(false);
          setIsBrandPickerOpen(false);
          return;
        }

        handleCloseModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalVisible, isBankPickerOpen, isBrandPickerOpen]);

  useEffect(() => {
    if (!isInvoiceModalOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsInvoiceModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInvoiceModalOpen]);

  const openEditor = (rect: DOMRect, card: CreditCardItem | null) => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    setModalOrigin(rect);
    setIsDeleteConfirmOpen(false);
    setBankQuery("");
    setIsBankPickerOpen(false);
    setIsBrandPickerOpen(false);

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
      setDraftBankId(featuredBankOptions[0]?.id ?? bankOptions[0]?.id ?? "");
      setDraftBrandId(brandOptions[0]?.id ?? "");
      setDraftLimit("");
      setDraftName("");
      setDraftSkin(skinOptions[0].id);
      setDraftTone(toneOptions[0].id);
    }

    setIsModalVisible(true);
    requestAnimationFrame(() => setIsModalActive(true));
  };

  const handleCloseModal = () => {
    setIsBankPickerOpen(false);
    setIsBrandPickerOpen(false);
    setIsModalActive(false);
    setIsDeleteConfirmOpen(false);

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

  const handleOverlayClick = () => {
    if (isBankPickerOpen || isBrandPickerOpen) {
      setIsBankPickerOpen(false);
      setIsBrandPickerOpen(false);
      return;
    }

    handleCloseModal();
  };

  const openBankPicker = () => {
    setIsBrandPickerOpen(false);
    setBankQuery("");
    setIsBankPickerOpen(true);
  };

  const openBrandPicker = () => {
    setIsBankPickerOpen(false);
    setIsBrandPickerOpen(true);
  };

  const openInvoiceModal = () => {
    const targetCardId = activeInvoiceCard?.id ?? cards[0]?.id ?? "";
    const lastInvoice = invoices
      .filter((invoice) => invoice.cardId === targetCardId)
      .sort((a, b) => (b.year - a.year) || (b.month - a.month))[0];
    setInvoiceCardId(targetCardId);
    setInvoiceTotalInput(lastInvoice ? formatLimitInput(lastInvoice.total) : "");
    setInvoiceClosingDay(lastInvoice ? String(lastInvoice.closingDay) : "10");
    setInvoiceDueDay(lastInvoice ? String(lastInvoice.dueDay) : "18");
    setInvoiceMonthsAhead("2");
    setIsInvoiceModalOpen(true);
  };

  const closeInvoiceModal = () => {
    setIsInvoiceModalOpen(false);
  };

  const handleSaveInvoice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!invoiceCardId) {
      return;
    }

    const totalValue = parseLimitValue(invoiceTotalInput);
    const closingValue = Math.min(31, Math.max(1, Number(invoiceClosingDay)));
    const dueValue = Math.min(31, Math.max(1, Number(invoiceDueDay)));
    const monthsAhead = Math.max(0, Math.min(12, Number(invoiceMonthsAhead)));
    if (!Number.isFinite(closingValue) || !Number.isFinite(dueValue)) {
      return;
    }

    const baseDate = new Date();
    const nextInvoices: InvoiceRecord[] = [];

    for (let offset = 0; offset <= monthsAhead; offset += 1) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + offset, 1);
      nextInvoices.push({
        id: crypto.randomUUID(),
        cardId: invoiceCardId,
        month: date.getMonth(),
        year: date.getFullYear(),
        total: totalValue,
        closingDay: closingValue,
        dueDay: dueValue
      });
    }

    setInvoices((prev) => {
      const updated = [...prev];
      nextInvoices.forEach((invoice) => {
        const index = updated.findIndex(
          (item) =>
            item.cardId === invoice.cardId &&
            item.month === invoice.month &&
            item.year === invoice.year
        );
        if (index >= 0) {
          updated[index] = { ...updated[index], ...invoice };
        } else {
          updated.push(invoice);
        }
      });
      return updated;
    });

    closeInvoiceModal();
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

  const handleRequestDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!editingId) {
      return;
    }

    setIsDeleteConfirmOpen(true);
  };

  const handleCancelDelete = (event: MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDeleteConfirmOpen(false);
  };

  const handleConfirmDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!editingId) {
      return;
    }

    setCards((prev) => prev.filter((card) => card.id !== editingId));
    setIsDeleteConfirmOpen(false);
    handleCloseModal();
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

    const maxDrag = isHorizontal ? cardMetrics.spacing * 0.6 : 120;
    const clamped = Math.max(-maxDrag, Math.min(delta, maxDrag));
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

    const threshold = isHorizontal ? cardMetrics.spacing * 0.25 : 70;
    if (Math.abs(dragOffset) < threshold) {
      setDragOffset(0);
      return;
    }

    if (switchTimeoutRef.current) {
      window.clearTimeout(switchTimeoutRef.current);
    }

    const direction = dragOffset > 0 ? 1 : -1;
    if (totalSlots <= 1) {
      setDragOffset(0);
      return;
    }

    const allowWrap = !isHorizontal || totalCards > 3;
    if (isHorizontal && !allowWrap) {
      if ((direction > 0 && activeSlotIndex === 0) || (direction < 0 && activeSlotIndex === emptyIndex)) {
        setDragOffset(0);
        return;
      }
    }

    setIsSwitching(true);
    const switchOffset = isHorizontal ? cardMetrics.spacing * direction : 90 * direction;
    setDragOffset(switchOffset);

    switchTimeoutRef.current = window.setTimeout(() => {
      const wrapMode = !isHorizontal || totalCards > 3;
      const nextIndex = isHorizontal
        ? direction > 0
          ? (value: number) => stepPrevIndex(value, wrapMode)
          : (value: number) => stepNextIndex(value, wrapMode)
        : direction > 0
        ? (value: number) => stepNextIndex(value, true)
        : (value: number) => stepPrevIndex(value, true);
      setActiveIndex((prev) => nextIndex(prev));
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
    "--card-drag-offset": `${dragOffset}px`,
    "--card-width": `${cardMetrics.width}px`,
    "--card-gap": `${cardMetrics.gap}px`
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
    ? (() => {
        const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 0;
        const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 0;
        const centerLeft = viewportWidth / 2 - modalOrigin.width / 2;
        const centerTop = viewportHeight / 2 - modalOrigin.height / 2;
        const offsetX = modalOrigin.left - centerLeft;
        const offsetY = modalOrigin.top - centerTop;

        return {
          "--modal-origin-width": `${modalOrigin.width}px`,
          "--modal-origin-height": `${modalOrigin.height}px`,
          "--modal-offset-x": `${offsetX}px`,
          "--modal-offset-y": `${offsetY}px`
        } as CSSProperties;
      })()
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
      className={`credito__card-wrap credito__card-wrap--active credito__card-wrap--clickable${
        isModalActive ? " is-modal-hidden" : ""
      }`}
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

  const renderSideItem = (item: CarouselItem, position: "prev" | "next", depth: number) => {
    const scale = Math.max(0.88, 1 - depth * 0.03);
    const opacity = Math.max(0.78, 1 - depth * 0.04);
    const zIndex = Math.max(0, 3 - depth);
    const key = item.kind === "card" ? item.card.id : `empty-${position}-${depth}`;

    return (
      <div
        key={key}
        className={`credito__card-wrap credito__card-wrap--${position}`}
        style={
          {
            "--stack-depth": `${depth}`,
            "--stack-scale": `${scale}`,
            "--stack-opacity": `${opacity}`,
            zIndex
          } as CSSProperties
        }
        aria-hidden="true"
      >
        {renderItemContent(item)}
      </div>
    );
  };

  const handleCarouselClick = (
    item: CarouselItem,
    index: number,
    event: MouseEvent<HTMLButtonElement>
  ) => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }

    setActiveIndex(index);
    const rect = event.currentTarget.getBoundingClientRect();
    openEditor(rect, item.kind === "card" ? item.card : null);
  };

  const wrapDelta = (delta: number) => {
    if (totalSlots <= 1) {
      return 0;
    }

    const half = totalSlots / 2;
    if (delta > half) {
      return delta - totalSlots;
    }
    if (delta < -half) {
      return delta + totalSlots;
    }

    return delta;
  };

  const renderCarouselItem = (item: CarouselItem, index: number) => {
    const spacing = Math.max(1, cardMetrics.spacing);
    const rawDelta = index - activeSlotIndex;
    const allowWrap = totalCards > 3;
    const delta = allowWrap ? wrapDelta(rawDelta) : rawDelta;
    const offset = delta * spacing + dragOffset;
    const distance = Math.abs(offset / spacing);
    const maxScale = 1.06;
    const minScale = 0.82;
    const scale = Math.max(minScale, maxScale - distance * 0.12);
    const isVisible = distance <= 3.4;
    const zIndex = Math.round(100 - distance * 10);
    const isActive = index === activeSlotIndex;
    const opacity = 1;
    return (
      <button
        key={`${item.kind}-${index}`}
        className={`credito__card-wrap credito__card-wrap--slide credito__card-wrap--clickable${
          isActive ? " credito__card-wrap--active" : ""
        }${isModalActive && isActive ? " is-modal-hidden" : ""}`}
        type="button"
        style={
          {
            "--card-x": `${offset}px`,
            "--card-scale": `${scale}`,
            "--card-opacity": `${isVisible ? opacity : 0}`,
            zIndex,
            pointerEvents: isVisible ? "auto" : "none"
          } as CSSProperties
        }
        aria-hidden={!isVisible}
        tabIndex={isVisible ? 0 : -1}
        onPointerDown={isActive ? handlePointerDown : undefined}
        onPointerMove={isActive ? handlePointerMove : undefined}
        onPointerUp={isActive ? handlePointerUp : undefined}
        onPointerCancel={isActive ? handlePointerCancel : undefined}
        onClick={(event) => handleCarouselClick(item, index, event)}
      >
        {renderItemContent(item)}
      </button>
    );
  };

  return (
    <section className="credito">
      <div className="credito__cards">
        <div className={stackClassName} style={stackStyle}>
          {isHorizontal
            ? carouselItems.map((item, index) => renderCarouselItem(item, index))
            : [
                prevItems.map(({ item, depth }) => renderSideItem(item, "prev", depth)),
                nextItems.map(({ item, depth }) => renderSideItem(item, "next", depth)),
                activeItem ? renderActiveItem(activeItem) : null
              ]}
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

      <section className="credito__billing">
        <header className="credito__section-header">
          <div>
            <h2 className="credito__section-title">Fatura atual</h2>
            <span className="credito__section-subtitle">
              {activeInvoiceCard ? (
                <>
                  {activeInvoiceBank?.label ?? "Cartão"} • {activeInvoiceCard.name}
                </>
              ) : (
                "Cadastre um cartão para acompanhar a fatura."
              )}
            </span>
          </div>
          <div className="credito__section-actions">
            <button
              className="button button--ghost button--sm"
              type="button"
              onClick={openInvoiceModal}
              disabled={!activeInvoiceCard}
            >
              Registrar fatura
            </button>
            <button
              className="button button--primary button--sm"
              type="button"
              disabled={!hasInvoice}
            >
              Pagar fatura
            </button>
          </div>
        </header>

        <div className="credito__billing-grid">
          {hasInvoice ? (
            <article className="credito__billing-summary app-glass">
              <div className="credito__billing-total">
                <span>Fatura atual</span>
                <strong className="sensitive">
                  <CurrencyValue value={invoiceTotalAmount} />
                </strong>
              </div>
              <div className="credito__billing-meta">
                <div>
                  <span>Fecha dia</span>
                  <strong>{closingDay}</strong>
                </div>
                <div>
                  <span>Vence dia</span>
                  <strong>{dueDay}</strong>
                </div>
                <div>
                  <span>Disponível</span>
                  <strong className="sensitive">
                    <CurrencyValue value={invoiceAvailable} />
                  </strong>
                </div>
              </div>
              <div className="credito__billing-progress">
                <div className="credito__billing-bar">
                  <span style={{ width: `${invoiceUsagePercent}%` }} />
                </div>
                <span>Uso do limite</span>
              </div>
            </article>
          ) : (
            <article className="credito__billing-summary app-glass credito__billing-summary--empty">
              <strong>Sem fatura registrada</strong>
              <span>
                Registre o valor total para acompanhar o ciclo do cartão.
              </span>
              <button
                className="button button--primary button--sm"
                type="button"
                onClick={openInvoiceModal}
                disabled={!activeInvoiceCard}
              >
                Registrar fatura
              </button>
            </article>
          )}

          <article className="credito__panel app-glass">
            <div className="credito__panel-header">
              <h3 className="credito__panel-title">Itens da fatura</h3>
              <button className="button button--link button--sm" type="button" disabled={!hasInvoice}>
                Ver todos
              </button>
            </div>
            {hasInvoice ? (
              <div className="credito__empty">
                Sem itens registrados. Eles aparecem quando você cadastrar compras.
              </div>
            ) : (
              <div className="credito__empty">
                Registre a fatura para visualizar os itens.
              </div>
            )}
          </article>

          <article className="credito__panel app-glass">
            <div className="credito__panel-header">
              <h3 className="credito__panel-title">Categorias e ajustes</h3>
              <button className="button button--link button--sm" type="button" disabled={!hasInvoice}>
                Editar
              </button>
            </div>
            {hasInvoice ? (
              <div className="credito__empty">
                Sem categorias vinculadas. Ajustes aparecem após registrar compras.
              </div>
            ) : (
              <div className="credito__empty">
                Registre a fatura para organizar categorias.
              </div>
            )}
          </article>

          <article className="credito__panel app-glass">
            <div className="credito__panel-header">
              <h3 className="credito__panel-title">Pagamentos parciais</h3>
              <button className="button button--link button--sm" type="button" disabled={!hasInvoice}>
                Registrar
              </button>
            </div>
            {hasInvoice ? (
              <div className="credito__empty">
                Nenhum pagamento registrado para esta fatura.
              </div>
            ) : (
              <div className="credito__empty">
                Registre a fatura antes de adicionar pagamentos.
              </div>
            )}
          </article>

          <article className="credito__panel app-glass">
            <div className="credito__panel-header">
              <h3 className="credito__panel-title">Projeção da fatura</h3>
              <button className="button button--link button--sm" type="button" disabled={!hasInvoice}>
                Detalhar
              </button>
            </div>
            {projectionInvoices.length ? (
              <ul className="credito__list">
                {projectionInvoices.map((item) => (
                  <li key={item.id} className="credito__list-item">
                    <div>
                      <strong>{formatMonthLabel(item.month, item.year)}</strong>
                      <span>Próximo ciclo</span>
                    </div>
                    <span className="credito__list-value sensitive">
                      {formatCurrency(item.total)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="credito__empty">
                {hasInvoice
                  ? "Sem projeções futuras registradas."
                  : "Registre a fatura para gerar projeções."}
              </div>
            )}
          </article>
        </div>
      </section>

      {isInvoiceModalOpen ? (
        <div className="credito__invoice-modal is-open" onClick={closeInvoiceModal}>
          <form
            className="credito__invoice-card"
            onSubmit={handleSaveInvoice}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Registrar fatura"
          >
            <div className="credito__invoice-header">
              <h3>Registrar fatura</h3>
              <p>Informe o total da fatura e os próximos ciclos.</p>
            </div>
            <label className="credito__field">
              <span>Cartão</span>
              <select
                value={invoiceCardId}
                onChange={(event) => setInvoiceCardId(event.target.value)}
                disabled={!cards.length}
              >
                {cards.length ? (
                  cards.map((card) => {
                    const bank = bankMap.get(card.bankId);
                    return (
                      <option key={card.id} value={card.id}>
                        {bank?.label ?? "Cartão"} • {card.name}
                      </option>
                    );
                  })
                ) : (
                  <option value="">Cadastre um cartão primeiro</option>
                )}
              </select>
            </label>
            <label className="credito__field">
              <span>Total da fatura</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={invoiceTotalInput}
                onChange={(event) => setInvoiceTotalInput(event.target.value)}
              />
            </label>
            <div className="credito__field-grid">
              <label className="credito__field">
                <span>Dia de fechamento</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={invoiceClosingDay}
                  onChange={(event) => setInvoiceClosingDay(event.target.value)}
                />
              </label>
              <label className="credito__field">
                <span>Dia de vencimento</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={invoiceDueDay}
                  onChange={(event) => setInvoiceDueDay(event.target.value)}
                />
              </label>
            </div>
            <label className="credito__field">
              <span>Meses seguintes</span>
              <select
                value={invoiceMonthsAhead}
                onChange={(event) => setInvoiceMonthsAhead(event.target.value)}
              >
                <option value="0">Apenas este mês</option>
                <option value="1">+1 mês</option>
                <option value="2">+2 meses</option>
                <option value="3">+3 meses</option>
                <option value="4">+4 meses</option>
                <option value="5">+5 meses</option>
                <option value="6">+6 meses</option>
              </select>
            </label>
            <div className="credito__invoice-actions">
              <button className="button button--ghost" type="button" onClick={closeInvoiceModal}>
                Cancelar
              </button>
              <button
                className="button button--primary"
                type="submit"
                disabled={!invoiceCardId}
              >
                Salvar fatura
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {isModalVisible ? (
        <div
          className={`credito__modal${isModalActive ? " is-open" : ""}`}
          onClick={handleOverlayClick}
          style={modalStyle}
        >
          <form
            id="credito-modal-form"
            className={`credito__modal-card credito__card credito__card--skin-${draftSkin} credito__card--tone-${draftTone}${
              isModalActive ? " is-open" : ""
            }`}
            onSubmit={handleSaveCard}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="credito__card-bank credito__card-bank--edit credito__card-logo-button"
              type="button"
              onClick={openBankPicker}
              aria-label="Selecionar banco"
            >
              <img src={draftBank.logo} alt={draftBank.label} />
            </button>

            <div className="credito__card-info">
              <input
                className="credito__card-input"
                type="text"
                inputMode="decimal"
                placeholder="R$ 0,00"
                value={draftLimit}
                onChange={(event) => setDraftLimit(event.target.value)}
                aria-label="Limite total"
              />
              <span className="credito__card-usage">
                Uso atual{" "}
                <span className="credito__card-usage-value">
                  <CurrencyValue value={modalUsed} />
                </span>
              </span>
            </div>

            <input
              className="credito__card-name-input"
              type="text"
              placeholder="Nome do cartão"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
            />

            <button
              className="credito__card-brand credito__card-brand--edit credito__card-logo-button"
              type="button"
              onClick={openBrandPicker}
              aria-label="Selecionar bandeira"
            >
              <img src={draftBrand.logo} alt={draftBrand.label} />
            </button>
          </form>
          {isBankPickerOpen ? (
            <div
              className="credito__picker-modal credito__picker-modal--banks is-open"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-label="Selecionar banco"
            >
              <div className="credito__picker credito__picker--banks">
                <div className="credito__picker-header">
                  <span>Banco</span>
                  <span className="credito__picker-subtitle">Selecione o banco emissor</span>
                </div>
                <div className="credito__picker-search">
                  <i className="fi fi-sr-search" aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Buscar banco"
                    value={bankQuery}
                    onChange={(event) => setBankQuery(event.target.value)}
                    aria-label="Buscar banco"
                  />
                </div>
                {!normalizedBankQuery ? (
                  <span className="credito__picker-hint">
                    Use a busca para encontrar bancos fora do preview.
                  </span>
                ) : null}
                <div className="credito__picker-preview">
                  <div className="credito__picker-featured">
                    {previewBankOptions.map((option) => (
                      <button
                        key={option.id}
                        className={`credito__picker-item${
                          option.id === draftBankId ? " is-selected" : ""
                        }`}
                        type="button"
                        onClick={() => {
                          setDraftBankId(option.id);
                          setIsBankPickerOpen(false);
                        }}
                        aria-pressed={option.id === draftBankId}
                      >
                        <img src={option.logo} alt="" aria-hidden="true" />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                  <div
                    className={`credito__picker-results${
                      normalizedBankQuery ? " is-open" : ""
                    }`}
                  >
                    {filteredBankOptions.length ? (
                      filteredBankOptions.map((option) => (
                        <button
                          key={option.id}
                          className={`credito__picker-item credito__picker-item--list${
                            option.id === draftBankId ? " is-selected" : ""
                          }`}
                          type="button"
                          onClick={() => {
                            setDraftBankId(option.id);
                            setIsBankPickerOpen(false);
                          }}
                          aria-pressed={option.id === draftBankId}
                        >
                          <img src={option.logo} alt="" aria-hidden="true" />
                          <span>{option.label}</span>
                        </button>
                      ))
                    ) : (
                      <span className="credito__picker-hint">Nenhum banco encontrado.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {isBrandPickerOpen ? (
            <div
              className="credito__picker-modal credito__picker-modal--brands is-open"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-label="Selecionar bandeira"
            >
              <div className="credito__picker credito__picker--brands">
                <div className="credito__picker-header">
                  <span>Bandeira</span>
                  <span className="credito__picker-subtitle">Escolha a bandeira do cartão</span>
                </div>
                <div className="credito__picker-grid">
                  {brandOptions.map((option) => (
                    <button
                      key={option.id}
                      className={`credito__picker-item credito__picker-item--brand${
                        option.id === draftBrandId ? " is-selected" : ""
                      }`}
                      type="button"
                      onClick={() => {
                        setDraftBrandId(option.id);
                        setIsBrandPickerOpen(false);
                      }}
                      aria-pressed={option.id === draftBrandId}
                    >
                      <img src={option.logo} alt="" aria-hidden="true" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
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
              <span className="credito__action-label">Tema</span>
              <span className="credito__action-value">
                {toneOptions.find((option) => option.id === draftTone)?.label ?? "Tema"}
              </span>
              <select
                className="credito__action-select"
                value={draftTone}
                onChange={(event) => setDraftTone(event.target.value as CardTone)}
                aria-label="Selecionar tema"
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
              type="submit"
              form="credito-modal-form"
              aria-label="Salvar cartão"
            >
              <i className="fi fi-sr-check" aria-hidden="true" />
            </button>
            {editingId ? (
              <button
                className="credito__action credito__action--icon credito__action--danger"
                type="button"
                aria-label="Excluir cartão"
                onClick={handleRequestDelete}
              >
                <i className="fi fi-sr-trash" aria-hidden="true" />
              </button>
            ) : null}
          </div>
          {isDeleteConfirmOpen ? (
            <div
              className="credito__confirm is-open"
              onClick={handleCancelDelete}
            >
              <div
                className="credito__confirm-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="credito-delete-title"
                onClick={(event) => event.stopPropagation()}
              >
                <p id="credito-delete-title" className="credito__confirm-title">
                  Excluir cartão?
                </p>
                <p className="credito__confirm-text">Essa ação não pode ser desfeita.</p>
                <div className="credito__confirm-actions">
                  <button className="credito__action" type="button" onClick={handleCancelDelete}>
                    Cancelar
                  </button>
                  <button
                    className="credito__action credito__action--danger"
                    type="button"
                    onClick={handleConfirmDelete}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

export default CreditoPage;
