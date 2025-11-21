# План реализации MVP - Онлайн-платформа "Тихая Память"

## Текущее состояние

✅ **Готово:**
- Минималистичный лендинг с Hero Section
- Пошаговый мастер (Stepper) с 5 шагами
- Сравнение готовых пакетов
- Конструктор индивидуального пакета
- 3D визуализатор атрибутики
- Калькулятор стоимости с детализацией
- Адаптивный дизайн (desktop + mobile)
- Черновики в localStorage
- Дизайн-система с токенами

## Цель MVP

**Пользователь заканчивает сделку онлайн без звонков:**
1. Собрать конфигурацию
2. Оплатить аванс (30-50%)
3. Получить договор/смету
4. Видеть статус в реальном времени

**Метрики успеха:**
- Конверсия в оплату: ≥ 10-15%
- NPS: ≥ 60
- SLA поставщиков: ≥ 97%

---

## Архитектура

### Репозитории

```
funeral-platform/
├── client-web/          # Next.js - публичный сайт + мастер
├── ops-console/         # React - панель диспетчера
├── supplier-portal/     # React - портал поставщиков
└── api-server/          # Node.js/Express - единый бэкенд
```

### Технологический стек

**Frontend:**
- Next.js 14+ (App Router)
- React 18+
- TypeScript
- Tailwind CSS v4
- Shadcn/ui компоненты
- Zustand (state management)
- React Hook Form + Zod (валидация)

**Backend:**
- Node.js + Express или Fastify
- PostgreSQL 16+
- Prisma ORM
- Redis (очереди, кэш)
- Bull (job queue)

**Инфраструктура:**
- Vercel (frontend hosting)
- Railway/Render (backend + DB)
- CloudFlare CDN
- Sentry (мониторинг ошибок)

**Интеграции:**
- ЮKassa/CloudPayments (эквайринг)
- Twilio/SMS.ru (SMS)
- SendGrid/Mailgun (email)
- Unleash (feature flags)

---

## База данных

### Схема (PostgreSQL)

```sql
-- Пользователи
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'client', -- client, admin, supplier
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Кейсы (заказы)
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'draft', -- draft, pending, confirmed, in_progress, completed, cancelled
  type VARCHAR(50), -- burial, cremation
  budget_cap INTEGER,
  total_amount INTEGER,
  paid_amount INTEGER DEFAULT 0,
  ceremony_date DATE,
  ceremony_location VARCHAR(500),
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Позиции заказа
CREATE TABLE case_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  category VARCHAR(100), -- coffin, flowers, transport, etc.
  item_type VARCHAR(100),
  item_name VARCHAR(255),
  supplier_id UUID REFERENCES suppliers(id),
  quantity INTEGER DEFAULT 1,
  unit_price INTEGER,
  total_price INTEGER,
  metadata JSONB, -- дополнительные параметры
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Поставщики
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255),
  category VARCHAR(100),
  description TEXT,
  rating DECIMAL(3,2),
  sla_score DECIMAL(5,2), -- процент выполненных вовремя заказов
  geo_coverage VARCHAR(255)[], -- массив регионов
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Слоты и квоты
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  category VARCHAR(100), -- hall, transport, burial
  slot_date DATE,
  slot_time TIME,
  duration_minutes INTEGER,
  capacity INTEGER, -- общее количество слотов
  reserved INTEGER DEFAULT 0, -- зарезервировано
  available INTEGER GENERATED ALWAYS AS (capacity - reserved) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Бронирования слотов
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  slot_id UUID REFERENCES slots(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Платежи
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  amount INTEGER,
  status VARCHAR(50), -- pending, processing, succeeded, failed, refunded
  method VARCHAR(50), -- card, sbp, cash
  provider VARCHAR(50), -- yookassa, cloudpayments
  provider_payment_id VARCHAR(255),
  metadata JSONB,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Согласия (GDPR, 152-ФЗ)
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  consent_type VARCHAR(100), -- privacy_policy, terms_of_service, data_processing
  version VARCHAR(20),
  text_hash VARCHAR(64),
  ip_address INET,
  user_agent TEXT,
  accepted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Документы
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id),
  doc_type VARCHAR(100), -- contract, invoice, receipt
  file_url VARCHAR(500),
  version INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Лог событий
CREATE TABLE event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50), -- case, payment, booking
  entity_id UUID,
  event_type VARCHAR(100),
  actor_id UUID REFERENCES users(id),
  actor_role VARCHAR(50),
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_case_items_case_id ON case_items(case_id);
CREATE INDEX idx_slots_date ON slots(slot_date);
CREATE INDEX idx_bookings_case_id ON bookings(case_id);
CREATE INDEX idx_payments_case_id ON payments(case_id);
CREATE INDEX idx_event_log_entity ON event_log(entity_type, entity_id);
```

---

## API Endpoints

### Аутентификация

```
POST   /api/auth/send-code        # Отправить код на email/phone
POST   /api/auth/verify-code      # Проверить код и войти
POST   /api/auth/logout           # Выход
GET    /api/auth/me               # Текущий пользователь
```

### Кейсы (заказы)

```
GET    /api/cases                 # Список заказов пользователя
POST   /api/cases                 # Создать черновик
GET    /api/cases/:id             # Получить заказ
PATCH  /api/cases/:id             # Обновить заказ
DELETE /api/cases/:id             # Удалить черновик
POST   /api/cases/:id/calculate   # Пересчитать стоимость
POST   /api/cases/:id/confirm     # Подтвердить заказ
```

### Слоты и бронирование

```
GET    /api/slots                 # Доступные слоты (query: date, category)
POST   /api/bookings              # Забронировать слот
DELETE /api/bookings/:id          # Отменить бронь
```

### Платежи

```
POST   /api/payments              # Создать платёж
GET    /api/payments/:id          # Статус платежа
POST   /api/webhooks/payments     # Webhook от платёжного провайдера
```

### Документы

```
POST   /api/documents/contract    # Сгенерировать договор
POST   /api/documents/invoice     # Сгенерировать смету
GET    /api/documents/:id         # Скачать документ
```

### Поставщики (supplier portal)

```
GET    /api/supplier/orders       # Заказы поставщика
PATCH  /api/supplier/orders/:id   # Принять/отклонить
GET    /api/supplier/schedule     # Расписание и слоты
PATCH  /api/supplier/slots/:id    # Обновить слот
```

### Админ (ops console)

```
GET    /api/admin/cases           # Все заказы (с фильтрами)
PATCH  /api/admin/cases/:id       # Управление заказом
GET    /api/admin/analytics       # Дашборды и метрики
GET    /api/admin/suppliers       # Управление поставщиками
```

---

## Спринт-план (6 недель)

### Спринт 1 (Недели 1-2): Фундамент

**Backend:**
- [ ] Настроить репозитории и CI/CD
- [ ] Развернуть PostgreSQL + Prisma
- [ ] Реализовать аутентификацию (magic link)
- [ ] API: CRUD для cases, case_items
- [ ] Интеграция эквайринга (ЮKassa)
- [ ] Webhook обработка платежей

**Frontend:**
- [ ] Разделить на 3 репо (client-web, ops-console, supplier-portal)
- [ ] Личный кабинет (/account)
- [ ] Список черновиков и заказов
- [ ] Миграция localStorage → API
- [ ] Страница "Мои заказы"

**DevOps:**
- [ ] Деплой на Vercel (frontend) + Railway (backend)
- [ ] Environment variables management
- [ ] Sentry для ошибок

### Спринт 2 (Недели 3-4): Оплата и документы

**Backend:**
- [ ] Генерация PDF (договор, смета) с PDFKit
- [ ] Email отправка через SendGrid
- [ ] Логирование согласий (GDPR/152-ФЗ)
- [ ] Split payments (подготовка)

**Frontend:**
- [ ] Шаг "Оплата" в мастере
- [ ] Страница оплаты с выбором метода
- [ ] Страница успешной оплаты
- [ ] Скачивание документов
- [ ] Явное согласие с checkbox + текст политики

**Тестирование:**
- [ ] E2E тесты критических путей (Playwright)
- [ ] Тестовые платежи

### Спринт 3 (Недели 5-6): Слоты и статусы

**Backend:**
- [ ] Модель slots + bookings
- [ ] API для доступных слотов
- [ ] Бронирование с квотами
- [ ] SMS уведомления (Twilio)
- [ ] Таймлайн событий

**Frontend:**
- [ ] UI выбора времени/слотов
- [ ] Ops-консоль v1 (таблица заказов)
- [ ] Supplier portal v1 (список заказов)
- [ ] Таймлайн статусов в ЛК
- [ ] Email/SMS уведомления

**Аналитика:**
- [ ] Базовая воронка в Amplitude/Mixpanel
- [ ] Дашборд метрик в ops-console

---

## Чеклист безопасности

- [ ] Все PII шифруется (at rest и in transit)
- [ ] HTTPS везде
- [ ] Rate limiting на API
- [ ] CORS правильно настроен
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Логирование всех критичных действий
- [ ] Регулярные бэкапы БД
- [ ] Retention policy для PII
- [ ] Согласия версионируются
- [ ] Audit trail для админских действий

---

## Миграция текущего кода

### Шаг 1: Сохранить текущую логику

Текущий `StepperWorkflow.tsx` содержит всю логику мастера:
- Сохранить функции расчёта цен
- Сохранить структуру formData
- Сохранить валидацию

### Шаг 2: Разбить на слои

```
client-web/
├── app/
│   ├── page.tsx                    # Лендинг
│   ├── wizard/
│   │   └── page.tsx                # Мастер
│   ├── account/
│   │   ├── page.tsx                # Мои заказы
│   │   └── [id]/page.tsx           # Детали заказа
│   └── payment/
│       └── [id]/page.tsx           # Страница оплаты
├── components/
│   ├── wizard/
│   │   ├── WizardProvider.tsx     # Context для состояния
│   │   ├── StepDocuments.tsx
│   │   ├── StepFormat.tsx
│   │   ├── StepLogistics.tsx
│   │   ├── StepAttributes.tsx
│   │   └── StepConfirmation.tsx
│   ├── pricing/
│   │   ├── PricingPackages.tsx
│   │   └── CustomPackageBuilder.tsx
│   └── ui/                         # Shadcn компоненты
├── lib/
│   ├── api.ts                      # API клиент
│   ├── pricing.ts                  # Логика расчётов
│   └── validation.ts               # Zod схемы
└── store/
    └── wizard.ts                   # Zustand store
```

### Шаг 3: API интеграция

Заменить localStorage на API:

```typescript
// До
localStorage.setItem('funeral-workflow-draft', JSON.stringify(draft));

// После
await api.cases.update(caseId, formData);
```

---

## Feature Flags

Использовать Unleash для поэтапного релиза:

```typescript
// Пример использования
import { useFlag } from '@unleash/proxy-client-react';

function Wizard() {
  const enablePayments = useFlag('wizard.enable_payments');
  const enableSlots = useFlag('wizard.enable_slot_booking');
  
  return (
    <>
      {enablePayments && <PaymentStep />}
      {enableSlots && <SlotSelection />}
    </>
  );
}
```

**Флаги:**
- `wizard.enable_payments` - включить оплату
- `wizard.enable_slot_booking` - включить бронирование слотов
- `wizard.enable_supplier_portal` - включить портал поставщиков
- `ops.enable_admin_console` - включить админку

---

## Роли и ответственность

| Роль | Ответственность |
|------|----------------|
| **Product Owner** | Приоритизация, партнёры, цены |
| **Tech Lead** | Архитектура, ревью кода, DevOps |
| **Frontend Dev** | Next.js, React, UI/UX |
| **Backend Dev** | API, БД, интеграции |
| **QA** | Тестирование, баг-репорты |
| **Ops Manager** | Онбординг поставщиков, SLA |
| **Legal** | Договоры, 152-ФЗ, compliance |

---

## Риски и митигация

| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| Нет API у учреждений | Высокая | Начать с квот и полу-ручного подтверждения |
| Юридические проблемы | Средняя | Консультация с юристом, явные opt-in |
| Низкая конверсия | Средняя | A/B тесты, упрощение потока |
| Технические сбои | Низкая | Мониторинг, алерты, резервные системы |
| Отказ поставщиков | Средняя | Резервные поставщики, SLA договоры |

---

## Следующие шаги

1. **Сейчас:** Завершить рефакторинг текущего кода
2. **Неделя 1:** Настроить репозитории и инфраструктуру
3. **Неделя 2:** Реализовать аутентификацию и API
4. **Неделя 3-4:** Интеграция оплаты и генерация документов
5. **Неделя 5-6:** Слоты, уведомления, порталы
6. **Неделя 7+:** Закрытая бета с реальными пользователями

---

## Контакты и ресурсы

- **Документация:** `/guidelines/`
- **API Docs:** (будет Swagger/OpenAPI)
- **Design System:** Figma + `/styles/globals.css`
- **Мониторинг:** Sentry + Vercel Analytics
- **Статус:** (будет status page)
