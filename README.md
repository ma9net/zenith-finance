# 🛡️ Zenith Finance | Enterprise Audit Engine
**A High-Precision, Zoneless Financial Dashboard built with Angular 21.**

Zenith Finance is a specialized auditing tool designed to solve the critical challenges of financial data integrity in JavaScript environments. It focuses on mathematical absolute truth, durable state, and multi-dimensional reporting.

---

## 🏛️ Architecture Philosophy
This project follows a **Modular Monorepo** structure, strictly separating concerns:
*   **`data-access`**: The "Brain" - Pure reactive logic, Signal-based state, and API resources.
*   **`feature-dashboard`**: The "Face" - Smart components managing user intent and workflow.
*   **`ui`**: The "Design System" - Reusable, atomic, and stateless presentation components.

## 🚀 Core Technical Features
| Feature | Implementation | Purpose |
| :--- | :--- | :--- |
| **Precision Math** | `Big.js` | Eliminates Floating Point errors in currency calculations. |
| **Zoneless Reactivity** | Angular 21 Signals | Maximum performance by removing `Zone.js` overhead. |
| **Durable State** | SSR-Safe LocalStorage | Persistence that survives refreshes and server-side rendering. |
| **Crypto Integration** | Angular `resource()` | Live spot-price conversion for LTC (BEP-20). |
| **Data Export** | `CsvUtils` | Native browser implementation for raw data portability. |

## 🛠️ Design Patterns
1. **Strategy Pattern**: Used for multi-currency handling to switch exchange logic dynamically.
2. **Resource Pattern**: Utilizing Angular 21's `resource` for declarative, non-blocking HTTP fetches.
3. **Smart/Dumb Component Pattern**: Ensuring UI components are strictly for presentation.

## 📦 Getting Started
1. **Install Dependencies**: `npm install`
2. **Run Development Server**: `ng serve`
3. **Build Production**: `ng build --configuration production`

---
*Developed with a focus on European Fintech Standards.*
