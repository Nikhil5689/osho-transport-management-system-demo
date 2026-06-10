# OSHO Transport Management System (Portfolio Demo Version)

OSHO Transport Management System is a premium, state-of-the-art enterprise web portal designed specifically for logistics providers and transport operators in Chhattisgarh, India. This special **Portfolio Demo Version** features an out-of-the-box client-side emulation mode, allowing reviewers to instantly test all dashboards, forms, reports, and analytics without configuring a live database backend.

## 🚀 Live Demo & Deployment

- **Vercel Live URL**: [Live Demo Link](https://osho-transport-management-system-demo.vercel.app) (Replace with your live deployment URL)
- **GitHub Repository**: [GitHub Link](https://github.com/Nikhil5689/osho-transport-management-system-demo) (Replace with your new repository URL)

---

## 🔑 Demo Login Instructions

On the login page, you can access the system with **one click**:

1. Click on the prominent **"Try Demo Login (One-click)"** button.
2. The application will automatically authenticate you as the **Demo Admin**.
3. A realistic dataset comprising settings, clients, bookings, and payments will be generated instantly and saved to your browser's `localStorage` for sandbox persistency.
4. You can freely edit, create, or delete any records. To start over with a fresh randomized dataset, simply click the **"Refresh Demo Data"** button on the top banner.

*Note: The standard admin username `rishabh` and password `Rishabh5689` can still be used if you configure your own Supabase credentials.*

---

## ⭐ Key Features

1. **Active KPIs & Metrics Dashboard**: Displaying real-time Total Revenue, Pending Dues, active shipments, total clients, and trends over the last 6 months.
2. **Interactive Charting**: Visualized monthly revenue bars and booking line trends using `recharts` for rich analytics.
3. **Consignments & Waybill Booking**: Form validations for Waybill (Docket) entry, autocalculating hamali charges, dockets, and total freight.
4. **Client Directories**: Full CRM with GST tracking, phone, and local Chhattisgarh city management (Raipur, Raigarh, Bilaspur, Bhilai, Korba).
5. **Invoices & Payments Tracking**: Log and record partial or full payments, track paid/partial/unpaid shipment balances.
6. **Detailed Reports**: Periodic filters (Today, Yesterday, Week, Month, Custom Range) and exporter to download data directly into Excel spreadsheets.
7. **Document Quotations**: Generate standard pricing tables for consignors.
8. **Company Preferences**: Customizable docket prefixes, starting waybill numbers, and tax invoice terms.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, TypeScript, Vite 7
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Zustand
- **Database/Backend**: Supabase (PostgreSQL client fallback to Client-side `localStorage` Sandbox in Demo Mode)
- **Spreadsheets & Exporter**: XLSX (SheetJS)
- **Charts**: Recharts

---

## 💻 Local Quick Start

Follow these steps to run the project locally on your machine:

### 1. Clone the repository
```bash
git clone https://github.com/Nikhil5689/osho-transport-management-system-demo.git
cd osho-transport-management-system-demo
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite). Click the **Try Demo Login** button to enter.

### 4. Build for Production
```bash
npm run build
```
This builds a single compiled HTML asset containing inlined assets under `dist/index.html` (due to `vite-plugin-singlefile`), which is highly optimized for deployment.

---

## ☁️ Vercel Deployment Instructions

Since this portfolio demo uses `localStorage` in Demo Mode, it can be deployed on Vercel in seconds with zero database environment setups required:

1. Import the new GitHub repository into your Vercel dashboard.
2. Ensure the Framework Preset is set to **Vite**.
3. The Build Command should be `npm run build` and Output Directory should be `dist`.
4. Click **Deploy**!
