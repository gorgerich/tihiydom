// src/lib/utils.ts

// Подсчёт общей суммы.
// Работает "по месту": умеет проходиться по числам, объектам и массивам.
export function calculateTotal(data: any): number {
  if (!data) return 0;

  // Массив значений / позиций
  if (Array.isArray(data)) {
    return data.reduce((sum, item: any) => {
      if (typeof item === "number") return sum + item;
      if (typeof item === "string") return sum + (parseFloat(item) || 0);

      if (item && typeof item === "object") {
        if (typeof item.price === "number") return sum + item.price;
        if (typeof item.cost === "number") return sum + item.cost;
        if (typeof item.value === "number") return sum + item.value;
      }

      return sum;
    }, 0);
  }

  // Объект с полями-стоимостями
  if (typeof data === "object") {
    return Object.values(data).reduce((sum, value: any) => {
      if (typeof value === "number") return sum + value;
      if (typeof value === "string") return sum + (parseFloat(value) || 0);

      if (value && typeof value === "object") {
        if (typeof value.price === "number") return sum + value.price;
        if (typeof value.cost === "number") return sum + value.cost;
        if (typeof value.value === "number") return sum + value.value;
      }

      return sum;
    }, 0);
  }

  // Прочие случаи — пробуем привести к числу
  if (typeof data === "number") return data;
  if (typeof data === "string") return parseFloat(data) || 0;

  return 0;
}

// Разбивка суммы по позициям для отображения в калькуляторе.
export function calculateBreakdown(data: any): { label: string; value: number }[] {
  if (!data) return [];

  // Массив
  if (Array.isArray(data)) {
    return data.map((item: any, index: number) => {
      const label =
        (item && typeof item === "object" && (item.label || item.name)) ||
        `Позиция ${index + 1}`;

      let value = 0;
      if (typeof item === "number") value = item;
      else if (typeof item === "string") value = parseFloat(item) || 0;
      else if (item && typeof item === "object") {
        if (typeof item.price === "number") value = item.price;
        else if (typeof item.cost === "number") value = item.cost;
        else if (typeof item.value === "number") value = item.value;
      }

      return { label, value };
    });
  }

  // Объект
  if (typeof data === "object") {
    return Object.entries(data).map(([key, raw]: [string, any]) => {
      let value = 0;
      if (typeof raw === "number") value = raw;
      else if (typeof raw === "string") value = parseFloat(raw) || 0;
      else if (raw && typeof raw === "object") {
        if (typeof raw.price === "number") value = raw.price;
        else if (typeof raw.cost === "number") value = raw.cost;
        else if (typeof raw.value === "number") value = raw.value;
      }

      return { label: key, value };
    });
  }

  return [];
}
