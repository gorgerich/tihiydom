// src/lib/utils.ts

export type CemeteryCategory = "standard" | "comfort" | "premium";

export interface PriceItem {
  label: string;
  amount: number;
}

export interface PriceBreakdown {
  items: PriceItem[];
  total: number;
}

// Простейшая модель цен — только чтобы сайт собирался и всё работало.
// Цифры можешь потом поменять под реальные.
const BASE_PRICES: Record<CemeteryCategory, number> = {
  standard: 120_000,
  comfort: 180_000,
  premium: 260_000,
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const n = parseFloat(value.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function calculateTotal(
  formData: any,
  cemeteryCategory: CemeteryCategory
): number {
  let total = BASE_PRICES[cemeteryCategory] ?? 0;

  // Аренда зала
  if (formData?.hasHall) {
    const duration = toNumber(formData.hallDuration) || 60;
    total += (duration / 60) * 8000;
  }

  // Транспорт для семьи
  if (formData?.needsFamilyTransport) {
    const seats = toNumber(formData.familyTransportSeats) || 5;
    total += seats * 1500;
  }

  // Доп. услуги
  if (Array.isArray(formData?.selectedAdditionalServices)) {
    total += formData.selectedAdditionalServices.length * 5000;
  }

  return Math.max(0, Math.round(total));
}

export function calculateBreakdown(
  formData: any,
  cemeteryCategory: CemeteryCategory
): PriceBreakdown {
  const items: PriceItem[] = [];

  const base = BASE_PRICES[cemeteryCategory] ?? 0;
  items.push({
    label: "Базовый пакет услуг",
    amount: base,
  });

  if (formData?.hasHall) {
    const duration = toNumber(formData.hallDuration) || 60;
    const cost = (duration / 60) * 8000;
    items.push({
      label: `Аренда зала, ${duration} мин`,
      amount: Math.round(cost),
    });
  }

  if (formData?.needsFamilyTransport) {
    const seats = toNumber(formData.familyTransportSeats) || 5;
    const cost = seats * 1500;
    items.push({
      label: `Транспорт для семьи, ${seats} мест`,
      amount: Math.round(cost),
    });
  }

  if (
    Array.isArray(formData?.selectedAdditionalServices) &&
    formData.selectedAdditionalServices.length > 0
  ) {
    const cost = formData.selectedAdditionalServices.length * 5000;
    items.push({
      label: "Дополнительные услуги",
      amount: cost,
    });
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return { items, total };
}
