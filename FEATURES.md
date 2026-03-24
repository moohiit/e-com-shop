# E-Commerce Shop - Feature Tracker

> Last updated: 2026-03-24 | Sprint 2 completed

---

## Completed Features

### Authentication & Authorization
- [x] User Registration with Email Verification
- [x] Login / Logout (User, Seller, Admin)
- [x] Forgot Password (OTP-based) + Reset Password
- [x] Role-Based Access Control (User / Seller / Admin / SuperAdmin)
- [x] JWT + Cookie Authentication

### Product Management
- [x] Product CRUD (create, edit, soft-delete, toggle active)
- [x] Category Management (hierarchical, multi-parent)
- [x] Cloudinary Image Upload (single & multiple)
- [x] Auto-generated slug from product name
- [x] Price breakdown (base price, discount %, tax %)
- [x] Stock management

### Browsing & Discovery
- [x] Product Search (name + description text search)
- [x] Filtering by category, price range
- [x] Sorting (price asc/desc, popularity, newest)
- [x] Pagination

### Cart & Wishlist
- [x] Cart Management (Redux + localStorage)
- [x] Wishlist (Redux + localStorage)

### Checkout & Payments
- [x] Multi-step Checkout (Address > Payment > Review)
- [x] Address Management (CRUD + default address)
- [x] Razorpay Payment Integration

### Orders
- [x] Order Creation & Order History
- [x] Order Details with item-level status
- [x] Seller Order Management (per-item status tracking)
- [x] Cancel individual order items

### Admin
- [x] Admin Dashboard with Stats (users, products, orders, revenue)
- [x] Admin User Management (list, edit, delete, toggle)
- [x] Admin Product & Category Management

### Reviews & Ratings (Sprint 1)
- [x] Review model with unique user+product constraint
- [x] Review API (CRUD, pagination, sorting)
- [x] Interactive star rating component
- [x] Submit/edit review form on Product Detail page
- [x] Review list with pagination and sort (latest/highest/lowest)
- [x] Auto-calculated average rating on Product model

### Order Emails & COD (Sprint 2)
- [x] Order confirmation email on order creation
- [x] Shipping status update email
- [x] Delivery confirmation email
- [x] Order cancellation email
- [x] Reusable HTML email templates (branded, responsive)
- [x] COD payment method (backend + improved checkout UI)
- [x] COD auto-marks order as paid when all items delivered

### Other
- [x] Contact Form with Email (Nodemailer)
- [x] Dark Mode
- [x] Responsive Design
- [x] RTK Query API caching

---

## Partially Done

| # | Feature | What's Missing |
|---|---------|----------------|
| 1 | Seller Dashboard | Page is a placeholder - needs stats, charts, analytics |
| 2 | Wishlist Backend Sync | Currently local-only (localStorage) - no backend persistence |

---

## Remaining Features (To Implement)

### High Priority

- [x] ~~**1. Product Reviews & Ratings UI**~~ — Completed in Sprint 1
- [ ] **2. Payment Refunds** - Process refunds via Razorpay when orders/items are cancelled
- [ ] **3. Return/Exchange (RMA) System** - Users request returns, sellers approve/reject, trigger refund flow
- [x] ~~**4. Order Status Email Notifications**~~ — Completed in Sprint 2

### Medium Priority

- [ ] **6. Seller Dashboard Analytics** - Revenue charts, top-selling products, order trends, earnings summary
- [ ] **7. Admin Analytics & Reports** - Sales reports, user growth charts, revenue trends (Chart.js / Recharts)
- [ ] **8. Inventory Management** - Low-stock alerts, bulk stock updates, auto-hide out-of-stock products
- [ ] **9. Wishlist Backend Sync** - Persist wishlist in database, sync across devices and sessions
- [x] ~~**10. COD (Cash on Delivery)**~~ — Completed in Sprint 2
- [ ] **11. Order Invoice/Receipt PDF** - Generate and download PDF invoice for each order

### Lower Priority

- [ ] **13. Seller Registration & Verification** - Application flow for becoming a seller, admin approval process
- [ ] **14. Product Variants** - Size, color, and other selectable options per product
- [ ] **15. Bulk Product Upload (CSV)** - Sellers upload products via CSV/Excel file
- [ ] **16. Recently Viewed Products** - Track and display recently viewed items on homepage/sidebar
- [ ] **17. Related/Recommended Products** - Show similar products on product detail page (by category/tags)
- [ ] **18. Live Chat / Customer Support** - Chat widget for buyer-seller or buyer-support communication
- [ ] **19. Unit & E2E Tests** - Jest for backend, React Testing Library + Playwright/Cypress for frontend
- [ ] **20. Deployment Setup** - Docker, CI/CD pipeline, production environment configuration

---

## Progress Summary

| Category         | Count |
|------------------|-------|
| Completed        | 22 features |
| Partially Done   | 2 features  |
| Remaining        | 15 features |
| **Overall**      | **~72% complete** |

---

## Notes

- Feature #5 (Coupon/Discount Codes) and #12 (Push/In-App Notifications) are intentionally excluded from scope.
- Numbering matches the original planning list for reference continuity (5 and 12 are skipped).
- Check off features and move them to the "Completed" section as they are implemented.
