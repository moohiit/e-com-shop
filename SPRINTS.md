# Sprint Plan - E-Commerce Shop

> Total: 8 Sprints | ~24 Days | Start: 2026-03-25

---

## Sprint 1 — Reviews & Ratings (Days 1-3)
> **Why first:** Core buying experience. Customers need social proof to purchase. Review model already exists — fastest high-impact win.

| Task | Scope | Status |
|------|-------|--------|
| Review API routes & controller (CRUD) | Backend | [x] |
| Calculate & store average rating on Product model | Backend | [x] |
| Submit review form on Product Detail page | Frontend | [x] |
| Display review list with ratings on Product Detail page | Frontend | [x] |
| Prevent duplicate reviews per user per product | Backend | [x] |
| Star rating component (interactive + display) | Frontend | [x] |

**Depends on:** Nothing (Review model exists)
**Unlocks:** Better product pages, trust signals

---

## Sprint 2 — Order Emails & COD (Days 4-6)
> **Why now:** Email notifications complete the order lifecycle. COD is a simple payment addition that increases conversion.

| Task | Scope | Status |
|------|-------|--------|
| Order confirmation email on successful payment | Backend | [x] |
| Shipping status update email (when seller marks shipped) | Backend | [x] |
| Delivery confirmation email | Backend | [x] |
| Order cancellation email | Backend | [x] |
| HTML email templates (reusable) | Backend | [x] |
| COD payment method backend support | Backend | [x] |
| COD order flow (mark as unpaid, collect on delivery) | Backend | [x] |
| Update checkout UI to handle COD selection properly | Frontend | [x] |

**Depends on:** Nothing
**Unlocks:** Complete order communication, more payment options

---

## Sprint 3 — Payment Refunds + Return/RMA (Days 7-10)
> **Why now:** Refunds are needed before RMA can work. Together they complete the post-purchase experience.

| Task | Scope | Status |
|------|-------|--------|
| Razorpay refund API integration (full & partial) | Backend | [x] |
| Refund on order item cancellation (auto-trigger) | Backend | [x] |
| Refund status tracking in Transaction model | Backend | [x] |
| Return request model/schema | Backend | [x] |
| User: request return (with reason) from order details | Frontend + Backend | [x] |
| Seller: view return requests, approve/reject | Frontend + Backend | [x] |
| Auto-trigger refund on return approval | Backend | [x] |
| Return status tracking UI (user + seller side) | Frontend | [x] |

**Depends on:** Sprint 2 (emails used for refund/return notifications)
**Unlocks:** Complete post-purchase flow

---

## Sprint 4 — Seller & Admin Analytics (Days 11-14)
> **Why now:** Dashboards are placeholders. Sellers and admins need actionable data to run the store.

| Task | Scope | Status |
|------|-------|--------|
| Install Recharts | Frontend | [x] |
| Seller dashboard API: revenue, orders, top products | Backend | [x] |
| Seller dashboard UI: stats cards + charts | Frontend | [x] |
| Seller earnings summary & transaction history | Frontend | [x] |
| Admin analytics API: sales, users, growth trends | Backend | [x] |
| Admin dashboard: revenue chart (daily/weekly/monthly) | Frontend | [x] |
| Admin dashboard: user growth chart | Frontend | [x] |
| Admin dashboard: top products & categories report | Frontend | [x] |

**Depends on:** Nothing (but better after Sprint 3 since refund data feeds into reports)
**Unlocks:** Business insights for sellers and admins

---

## Sprint 5 — Inventory & Wishlist Sync (Days 15-17)
> **Why now:** Inventory management prevents overselling. Wishlist sync is a quick backend addition that improves UX.

| Task | Scope | Status |
|------|-------|--------|
| Low-stock threshold field on Product model | Backend | [x] |
| Low-stock alerts on seller/admin dashboard | Frontend | [x] |
| Auto-hide out-of-stock products from listings | Backend | [x] |
| Bulk stock update UI for sellers | Frontend | [x] |
| Wishlist model/schema (backend) | Backend | [x] |
| Wishlist API routes (add/remove/list) | Backend | [x] |
| Sync frontend wishlist Redux slice with backend | Frontend | [x] |
| Persist wishlist across login/logout/devices | Frontend + Backend | [x] |

**Depends on:** Nothing
**Unlocks:** Reliable stock management, cross-device wishlist

---

## Sprint 6 — Invoice PDF & Seller Registration (Days 18-20)
> **Why now:** Invoices complete the order experience. Seller registration opens the platform to new sellers.

| Task | Scope | Status |
|------|-------|--------|
| Install PDF library (pdfkit or jspdf) | Setup | [x] |
| Generate order invoice PDF (items, prices, taxes, address) | Backend | [x] |
| Download invoice button on order details page | Frontend | [x] |
| Seller application form (public page) | Frontend | [x] |
| Seller application model & API | Backend | [x] |
| Admin: review & approve/reject seller applications | Frontend + Backend | [x] |
| Email notification on application status change | Backend | [x] |

**Depends on:** Sprint 2 (email templates reused)
**Unlocks:** Downloadable receipts, marketplace growth

---

## Sprint 7 — Product Variants, Bulk Upload & Discovery (Days 21-23)
> **Why now:** Variants and bulk upload are seller productivity features. Discovery features boost engagement.

| Task | Scope | Status |
|------|-------|--------|
| Product variants schema (size, color, etc.) | Backend | [x] |
| Variant selection UI on product detail page | Frontend | [x] |
| Variant-aware cart & checkout | Frontend + Backend | [x] |
| CSV upload endpoint for bulk products | Backend | [x] |
| Bulk upload UI with template download | Frontend | [x] |
| Recently viewed products (localStorage tracking) | Frontend | [x] |
| Recently viewed section on homepage | Frontend | [x] |
| Related products API (same category/tags) | Backend | [x] |
| Related products section on product detail page | Frontend | [x] |

**Depends on:** Nothing
**Unlocks:** Richer product catalog, better discovery

---

## Sprint 8 — Chat, Tests & Deployment (Days 24-26)
> **Why last:** Chat is a standalone feature. Tests & deployment are the final polish before go-live.

| Task | Scope | Status |
|------|-------|--------|
| Chat model (messages between buyer-seller) | Backend | [ ] |
| Real-time chat with Socket.io | Backend + Frontend | [ ] |
| Chat UI widget on product/order pages | Frontend | [ ] |
| Backend unit tests (Jest) — auth, orders, products | Backend | [ ] |
| Frontend component tests (React Testing Library) | Frontend | [ ] |
| E2E tests (Playwright/Cypress) — critical flows | Frontend | [ ] |
| Dockerfile + docker-compose | DevOps | [ ] |
| CI/CD pipeline (GitHub Actions) | DevOps | [ ] |
| Production env config & deployment | DevOps | [ ] |

**Depends on:** All features complete
**Unlocks:** Production-ready application

---

## Sprint Dependency Map

```
Sprint 1 (Reviews)          ──┐
Sprint 2 (Emails + COD)     ──┼── Sprint 3 (Refunds + RMA)
                               │
Sprint 4 (Analytics)         ──┘ (better after Sprint 3)
Sprint 5 (Inventory + Wishlist)    [independent]
Sprint 6 (Invoice + Seller Reg)    [reuses Sprint 2 emails]
Sprint 7 (Variants + Discovery)    [independent]
Sprint 8 (Chat + Tests + Deploy)   [after all features]
```

---

## Quick Reference

| Sprint | Days | Features | Priority |
|--------|------|----------|----------|
| 1 | 1-3 | Reviews & Ratings | High |
| 2 | 4-6 | Order Emails + COD | High |
| 3 | 7-10 | Refunds + Returns/RMA | High |
| 4 | 11-14 | Seller & Admin Analytics | Medium |
| 5 | 15-17 | Inventory + Wishlist Sync | Medium |
| 6 | 18-20 | Invoice PDF + Seller Registration | Medium |
| 7 | 21-23 | Variants + Bulk Upload + Discovery | Lower |
| 8 | 24-26 | Chat + Tests + Deployment | Lower |
