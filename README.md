# Invoice Manager Mobile App

A professional, production-ready mobile application for small businesses and freelancers to generate, manage, and track branded invoices offline or online.

## Key Features

- **Authentication**: Email + password login/signup flow, forgot password reset modal, and instant 1-click demo login.
- **Dashboard**: KPI Summary Cards (Total Invoiced, Total Paid, Unpaid/Overdue, Current Month's Revenue), Quick actions (+ New Invoice, + Add Client), and recent activity feed.
- **Client Management**: Full CRUD client directory (name, company, email, phone, address, notes) with billing history viewer per client.
- **Invoice Creation**: Auto-generated sequential invoice numbers (`INV-2026-001`), client picker, dynamic line item builder, tax % rate, discount deduction, grand total calculator, due dates, notes, and currency selector (USD, EUR, GBP, INR, CAD, AUD, JPY).
- **Offline-First Database**: 100% offline functionality using Dexie.js (IndexedDB). No internet connection required to create or edit invoices.
- **PDF Generation & Export**: Generate high-resolution branded PDF invoices with custom business logo, billing details, line items table, and bank payment footer.
- **Sharing**: Direct WhatsApp messaging share links, Email `mailto:` export, and PDF download.
- **Payment Tracking**: Mark invoice as Paid / Partially Paid modal with payment method picker (Bank Transfer, Credit Card, Cash, PayPal) and date logging.
- **Financial Analytics & Reports**: Revenue totals, status distribution charts, and top revenue client rankings.
- **Business Settings & Themes**: Configurable business profile, bank footer info, default currency/tax, dark mode toggle, and brand color customizer.

## Folder Structure

```
invoice_manager/
├── public/
│   ├── favicon.svg
├── src/
│   ├── components/
│   │   ├── auth/            # Auth modal (login, signup, forgot password)
│   │   ├── clients/         # Client list, client form modal, invoice history
│   │   ├── common/          # Header, responsive Navigation (mobile tab bar & desktop sidebar)
│   │   ├── dashboard/       # Summary KPI cards, quick actions, recent activity feed
│   │   ├── invoices/        # Invoice list, Invoice form builder modal, Invoice detail view
│   │   ├── reports/         # Financial reports & status distribution
│   │   └── settings/        # Business profile, bank details, dark mode, currency defaults
│   ├── db/
│   │   ├── database.ts      # Dexie offline database schema
│   │   └── seed.ts          # Demo seed data (clients, invoices, profile)
│   ├── services/
│   │   ├── pdfService.ts    # PDF invoice generator & WhatsApp/Email sharing links
│   │   └── notificationService.ts # Local reminder notifications
│   ├── store/
│   │   ├── useAuthStore.ts    # User login & session state
│   │   ├── useClientStore.ts  # Client CRUD store
│   │   ├── useInvoiceStore.ts # Invoice CRUD & status store
│   │   └── useSettingsStore.ts# Business profile & theme store
│   ├── types/               # TypeScript interfaces
│   ├── utils/               # Currency & invoice total calculation utilities
│   ├── App.tsx              # Main entry component
│   ├── index.css            # Tailwind design tokens & font settings
│   └── main.tsx
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## How to Run Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser or emulator.

3. **Build for Production**:
   ```bash
   npm run build
   ```
"# Invoice-Manager" 
