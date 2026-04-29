# Zenith Finance Hub 🚀
**Enterprise-Grade Financial Auditor | Built with Angular 21**

## 🎯 Project Vision
Zenith Finance Hub is a high-performance financial auditing tool designed for European enterprise standards. It demonstrates advanced state management using **Angular Signals**, precise financial math via **Big.js**, and a scalable **Nx Monorepo** architecture.

## 🛠️ Tech Stack
- **Framework:** Angular 21 (Signals-First, Zoneless)
- **Architecture:** Nx Monorepo (DDD Pattern)
- **Math:** Big.js (Arbitrary-precision decimal arithmetic)
- **Styling:** Tailwind CSS
- **Build Tool:** Esbuild

## 🏗️ Architecture Overview
This project follows the **Domain-Driven Design (DDD)** approach:
- `libs/finance/data-access`: Centralized State & Logic.
- `libs/finance/feature-dashboard`: Page-level orchestration.
- `libs/shared/ui`: Reusable design system components.

## 🚀 Getting Started (Development)
1. **Install Dependencies:** `npm install`
2. **Start Application:** `npx nx serve dashboard`
3. **Run Tests:** `npx nx test finance-data-access`

## 📈 Key Features
- [x] Signal-based reactive state.
- [x] Precision tax calculation for EU regions.
- [x] Responsive Enterprise Dashboard.
- [ ] Multi-currency support (Planned).