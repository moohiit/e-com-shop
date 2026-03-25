# E-Commerce Shop - Feature Tracker

> Last updated: 2026-03-25 | Sprint 5 completed

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
- [x] Cart backend sync (model, API at `/api/cart`, syncs on login)

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

### Refunds & Returns (Sprint 3)
- [x] Razorpay refund integration (auto-refund on cancellation for paid orders)
- [x] Return request system (model, API, 7-day return window)
- [x] User: request return from order details with reason
- [x] Seller: view/approve/reject return requests (dedicated page)
- [x] Auto-refund on return approval + stock restoration
- [x] Return status tracking on order details (Pending/Approved/Rejected/Refunded)

### Seller & Admin Analytics (Sprint 4)
- [x] Seller Dashboard: stat cards (orders, revenue, products), revenue bar chart, order status pie chart, top products table
- [x] Admin Dashboard: stat cards with time filters (today/month/year/all), revenue+orders bar chart, user growth line chart, top products table
- [x] Backend aggregation pipelines for revenue trends, user growth, top products

### Inventory & Wishlist Sync (Sprint 5)
- [x] `lowStockThreshold` field on Product model with `isLowStock` virtual
- [x] Auto-hide out-of-stock products from public product listings
- [x] Low-stock alert section on seller dashboard
- [x] Inventory management page for sellers (low-stock tab + all products tab)
- [x] Bulk stock update API and UI (edit multiple products, save at once)
- [x] Low-stock and bulk-stock API endpoints (`/product/low-stock`, `/product/bulk-stock`)
- [x] Wishlist backend model and API (`/api/wishlist` — add, remove, list, clear)
- [x] Frontend wishlist syncs with backend when logged in, falls back to localStorage for guests
- [x] ProductDetail and Wishlist page updated for backend sync
- [x] Cart backend model and API (`/api/cart` — get, add, update, remove, clear, sync)
- [x] Frontend cart syncs with backend on login, localStorage fallback for guests

### Other
- [x] Contact Form with Email (Nodemailer)
- [x] Dark Mode
- [x] Responsive Design
- [x] RTK Query API caching

---

## Remaining Features (To Implement)

### Completed High Priority

- [x] ~~**1. Product Reviews & Ratings UI**~~ — Sprint 1
- [x] ~~**2. Payment Refunds**~~ — Sprint 3
- [x] ~~**3. Return/Exchange (RMA) System**~~ — Sprint 3
- [x] ~~**4. Order Status Email Notifications**~~ — Sprint 2

### Completed Medium Priority

- [x] ~~**6. Seller Dashboard Analytics**~~ — Sprint 4
- [x] ~~**7. Admin Analytics & Reports**~~ — Sprint 4
- [x] ~~**8. Inventory Management**~~ — Sprint 5
- [x] ~~**9. Wishlist Backend Sync**~~ — Sprint 5
- [x] ~~**10. COD (Cash on Delivery)**~~ — Sprint 2

### Medium Priority (Remaining)

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
| Completed        | 30 features |
| Partially Done   | 0 features  |
| Remaining        | 9 features  |
| **Overall**      | **~87% complete** |

---

## Notes

- Feature #5 (Coupon/Discount Codes) and #12 (Push/In-App Notifications) are intentionally excluded from scope.
- Numbering matches the original planning list for reference continuity (5 and 12 are skipped).
- Check off features and move them to the "Completed" section as they are implemented.
