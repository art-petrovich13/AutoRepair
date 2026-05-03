<div align="center">

# 🔧 AutoRepair

**Информационная система фирмы по ремонту автомобилей**

![C#](https://img.shields.io/badge/C%23-NET%2010-512BD4?style=flat-square&logo=dotnet)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-compose-2496ED?style=flat-square&logo=docker)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)

Курсовая работа — полнофункциональное веб-приложение для управления заказами, клиентами, сотрудниками и аналитикой автосервиса.

</div>

---

## Стек технологий

| Слой | Технологии |
|------|-----------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Recharts |
| **Backend** | C# ASP.NET Core 10 Web API, Entity Framework Core |
| **База данных** | PostgreSQL 16 (Docker) |
| **ORM** | EF Core + Npgsql + EFCore.NamingConventions |
| **Экспорт** | xlsx, docx, file-saver |

---

## Функциональность

- **Заказы** — создание, просмотр деталей, смена статуса, удаление. Каждый заказ включает список услуг и запчастей с автоподсчётом суммы
- **Клиенты** — полный CRUD, отображение количества привязанных автомобилей
- **Автомобили** — учёт транспорта с привязкой к клиенту, VIN и гос. номером
- **Сотрудники** — управление персоналом (карточный вид)
- **Услуги** — каталог услуг с ценой и длительностью
- **Аналитика** — дашборд с 4 типами графиков (выручка по месяцам, статусы заказов, топ услуг, нагрузка по сотрудникам)
- **Экспорт отчётов** — выгрузка в `.xlsx` (с отдельным листом сводки) и `.docx` (с таблицей и сводкой)

---

## Структура проекта

```
autorepair/
├── docker-compose.yml
├── init.sql                        ← схема БД + seed-данные
│
├── AutoRepairApi/
│   ├── AutoRepairApi.sln
│   └── AutoRepairApi/
│       ├── Program.cs
│       ├── appsettings.json
│       ├── Models/
│       │   ├── Client.cs
│       │   ├── Vehicle.cs
│       │   ├── Employee.cs
│       │   ├── Service.cs
│       │   ├── Order.cs
│       │   ├── OrderService.cs
│       │   └── SparePart.cs
│       ├── Data/
│       │   └── AppDbContext.cs
│       ├── DTOs/
│       │   ├── ClientDto.cs
│       │   ├── VehicleDto.cs
│       │   ├── EmployeeDto.cs
│       │   ├── ServiceDto.cs
│       │   └── OrderDto.cs
│       └── Controllers/
│           ├── ClientsController.cs
│           ├── VehiclesController.cs
│           ├── EmployeesController.cs
│           ├── ServicesController.cs
│           ├── OrdersController.cs
│           └── StatisticsController.cs
│
└── AutoRepairFrontend/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── App.tsx
        ├── api/index.ts
        ├── types/index.ts
        ├── components/
        │   └── Layout.tsx
        └── pages/
            ├── Dashboard.tsx
            ├── Orders.tsx
            ├── Clients.tsx
            ├── Vehicles.tsx
            ├── Employees.tsx
            ├── Services.tsx
            └── Reports.tsx
```

---

## Схема базы данных

```
clients ──────────────── vehicles ──────────────── orders
  id PK                    id PK                     id PK
  name                     client_id FK ──────────►  vehicle_id FK
  phone                    brand                     employee_id FK ──► employees
  email                    model                     status               id PK
  created_at               year                      created_at           name
                           license_plate             completed_at         position
                           vin                       total_amount         phone
                                                     notes                hire_date
                                                      │
                                          ┌───────────┴────────────┐
                                          ▼                         ▼
                                   order_services             spare_parts
                                     id PK                     id PK
                                     order_id FK                order_id FK
                                     service_id FK ──► services name
                                     quantity           quantity  unit_price
                                     price              id PK
                                                        name
                                                        description
                                                        price
                                                        duration_hours
```

---

## Быстрый старт

### Требования

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Visual Studio 2022](https://visualstudio.microsoft.com/) (с поддержкой ASP.NET)
- [Node.js 18+](https://nodejs.org/)

---

### 1. База данных

```bash
# В корне проекта (там, где лежит docker-compose.yml)
docker-compose up -d
```

PostgreSQL поднимется на порту `5432`. При первом запуске автоматически применится `init.sql` — создадутся все таблицы и загрузятся тестовые данные.

---

### 2. Backend

Открыть `AutoRepairApi/AutoRepairApi.sln` в **Visual Studio 2022**.

Пакеты подтянутся автоматически. Если нет — через `Tools → NuGet Package Manager → Restore`.

```
Запустить: F5  (или кнопка Run)
API:     http://localhost:5XXX
Swagger: http://localhost:5XXX/swagger
```

Строка подключения к БД уже прописана в `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=autorepair;Username=postgres;Password=postgres123"
}
```

---

### 3. Frontend

```bash
cd AutoRepairFrontend

npm install
npm run dev
```

Приложение откроется на `http://localhost:5173`

---

## API Endpoints

### Clients `/api/clients`
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/clients` | Список всех клиентов |
| GET | `/api/clients/{id}` | Клиент по ID |
| POST | `/api/clients` | Создать клиента |
| PUT | `/api/clients/{id}` | Обновить клиента |
| DELETE | `/api/clients/{id}` | Удалить клиента |

### Vehicles `/api/vehicles`
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/vehicles` | Все автомобили |
| GET | `/api/vehicles/{id}` | Автомобиль по ID |
| GET | `/api/vehicles/by-client/{clientId}` | Авто клиента |
| POST | `/api/vehicles` | Добавить автомобиль |
| PUT | `/api/vehicles/{id}` | Обновить |
| DELETE | `/api/vehicles/{id}` | Удалить |

### Employees `/api/employees`
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/employees` | Все сотрудники |
| POST | `/api/employees` | Добавить |
| PUT | `/api/employees/{id}` | Обновить |
| DELETE | `/api/employees/{id}` | Удалить |

### Services `/api/services`
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/services` | Каталог услуг |
| POST | `/api/services` | Добавить услугу |
| PUT | `/api/services/{id}` | Обновить |
| DELETE | `/api/services/{id}` | Удалить |

### Orders `/api/orders`
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/orders` | Все заказы (с деталями) |
| GET | `/api/orders/{id}` | Заказ по ID |
| POST | `/api/orders` | Создать заказ |
| PATCH | `/api/orders/{id}/status` | Сменить статус |
| DELETE | `/api/orders/{id}` | Удалить |

### Statistics `/api/statistics`
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/statistics/overview` | Общая сводка |
| GET | `/api/statistics/orders-by-status` | Заказы по статусам |
| GET | `/api/statistics/revenue-by-month` | Выручка по месяцам |
| GET | `/api/statistics/top-services` | Топ-5 услуг |
| GET | `/api/statistics/orders-by-employee` | Заказы по сотрудникам |
| GET | `/api/statistics/export-orders` | Данные для экспорта |

---

## Статусы заказов

| Статус | Описание |
|--------|----------|
| `Pending` | Ожидает — заказ принят, работа не начата |
| `InProgress` | В работе — автомобиль на ремонте |
| `Completed` | Завершён — работа выполнена |
| `Cancelled` | Отменён |

---

## Переменные окружения

По умолчанию всё настроено для локальной разработки. При необходимости можно изменить:

**Backend** (`appsettings.json`):
```
Host, Port, Database, Username, Password
```

**Frontend** (`src/api/index.ts`):
```ts
baseURL: 'http://localhost:5000/api'
```

---

## Зависимости

### Backend (NuGet)
```
EFCore.NamingConventions           8.0.0
Microsoft.EntityFrameworkCore      8.0.0
Microsoft.EntityFrameworkCore.Tools 8.0.0
Npgsql.EntityFrameworkCore.PostgreSQL 8.0.0
Swashbuckle.AspNetCore             6.5.0
```

### Frontend (npm)
```
react, react-dom, react-router-dom
axios
recharts
xlsx
docx
file-saver
tailwindcss, postcss, autoprefixer
```