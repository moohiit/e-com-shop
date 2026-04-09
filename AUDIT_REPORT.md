# Pre-Production Audit Report

Generated: 2026-04-09
Status: In progress — fixes being applied top-down (Critical → Low)

---

## BACKEND — CRITICAL

1. **Payment verification has no ownership check** — `backend/controllers/transactionController.js:253`. Anyone authenticated can mark any orderId as paid by replaying a valid signature.
2. **Stock race condition** — `backend/controllers/orderController.js:78`, `backend/controllers/transactionController.js:85`. Stock check + decrement is not atomic → overselling under concurrency.
3. **No payment idempotency** — `backend/controllers/transactionController.js:274`. Same `paymentId` can be processed twice → duplicate transactions, double-paid sellers. No unique index on paymentId.
4. **Transaction read leaks PII** — `backend/controllers/transactionController.js:324-337`. `getTransactionById` only checks `protect`, not ownership. Any user can read any payment record by guessing IDs.
5. **Refund math ignores shipping** — `backend/controllers/orderController.js:510`. `cancelOrderItem` refund = `price * qty`; partial cancellations refund wrong amount.

## BACKEND — HIGH

6. **No DB transactions on order creation** — `backend/controllers/orderController.js:35-209`. Stock decrement, order save, seller-order links happen without a Mongo session → partial-failure inconsistencies.
7. **Client-supplied tax/discount trusted** — `backend/controllers/orderController.js:57-69`. `discountPercentage`, `taxPercentage`, `taxAmount` come from request body without server-side recompute → revenue tampering.
8. **Refund processing not authorized** — `backend/controllers/refundController.js:9`. No seller/owner check.
9. **Duplicate route definitions** — `backend/routes/transactionRoutes.js:30,36`. Two `router.route("/:id")` blocks; second is dead.
10. **No rate limiting on auth/OTP** — `backend/app.js`. `/send-otp`, `/verify-otp`, `/login` open to brute force.
11. **Regex injection in admin search** — `backend/controllers/adminController.js:17-20`. `req.query.keyword` passed raw to `$regex`.
12. **Payment path doesn't recompute totals** — `backend/controllers/transactionController.js:68-87`. Trusts client `itemsPrice`, `totalDiscount`, `taxPrice`.

## BACKEND — MEDIUM / LOW

13. Cart upsert race could create duplicate carts — `backend/models/Cart.js:23`.
14. Bulk stock update missing seller-ownership check — `backend/controllers/productController.js:408`.
15. `rawResponse: req.body` stored in transaction record (signatures + secrets persisted) — `backend/controllers/transactionController.js:176,194,284,303`.
16. `cancelOrderItem` doesn't verify caller owns the item — `backend/controllers/orderController.js:432`.
17. `getAllTransactions` unpaginated — `backend/controllers/transactionController.js:340-351`.
18. Return refund amount uses current item price, not original charge — `backend/controllers/returnController.js:75`.
19. OTP via `Math.random()` (not crypto) — `backend/controllers/authController.js:247`.
20. Verbose error messages leak expected vs received prices — `backend/controllers/orderController.js:90-92`.
21. No CSRF protection, no helmet headers — `backend/app.js`.

---

## FRONTEND — CRITICAL

1. **Cart vs OrderReview compute totals independently** — `frontend/src/pages/Cart/Cart.jsx:150-173`, `frontend/src/pages/Checkout/OrderReview.jsx:23-41`. Two formulas → user sees one total, gets charged another.
2. **Tax math may double-count** — `frontend/src/pages/Cart/Cart.jsx:156-161`. `taxAmount * quantity` only correct if `taxAmount` is per-unit; defaults to 0 silently masks missing data.
3. **Hardcoded shipping rule on client** — `frontend/src/pages/Cart/Cart.jsx:169`, `frontend/src/pages/Checkout/OrderReview.jsx:36`. `> 500 ? 0 : 50` lives only in frontend; backend can disagree.
4. **Form labels not associated with inputs** — `frontend/src/pages/Auth/Login.jsx:73`, `frontend/src/pages/Auth/Register.jsx:38-80`, `frontend/src/components/checkout/AddressForm.jsx`. Missing `htmlFor`/`id` pairs — screen readers broken.

## FRONTEND — HIGH (UI/UX + Mobile)

5. **Admin/seller tables not mobile-friendly** — `frontend/src/pages/Admin/ManageUsers.jsx:107-150`, AdminProducts, SellerOrders, `frontend/src/pages/Seller/Dashboard.jsx:151-171`. All rely on `overflow-x-auto`; columns don't stack — unusable on phones.
6. **Checkout MUI Stepper breaks on mobile** — `frontend/src/pages/Checkout/Checkout.jsx:161-166`. `alternativeLabel` step labels wrap badly on small screens.
7. **Cart layout skips tablet breakpoint** — `frontend/src/pages/Cart/Cart.jsx:208`. `grid-cols-1 lg:grid-cols-3` — no `md:` rule, wasted space at 768–1024px.
8. **ProductCard expects `discountPrice`, cart uses `finalPrice`** — `frontend/src/components/products/ProductCard.jsx:80-91`. Field mismatch hides discounts.

## FRONTEND — MEDIUM

9. Home category images missing alt text — `frontend/src/pages/Home/Home.jsx:183-212`.
10. ProductDetail useEffect deps `[productData, wishlist]` risks re-render loop — `frontend/src/pages/Products/ProductDetail.jsx:59-63`.
11. PaymentForm radio missing `id`, label not bound — `frontend/src/components/checkout/PaymentForm.jsx:49-56`.
12. Admin/Seller dashboard charts have no error state, only loading + empty — `frontend/src/pages/Admin/AdminDashboard.jsx:160-194`, `frontend/src/pages/Seller/SellerDashboard.jsx:175-199`.
13. Wishlist→cart price math applies tax after discount; may not match backend order — `frontend/src/pages/Wishlist/Wishlist.jsx:47-59`.
14. Cart sync useEffect missing `user` in deps — `frontend/src/pages/Cart/Cart.jsx:44-55`. Login/logout doesn't re-sync.

## FRONTEND — LOW

15. Profile dropdown is hover-only (`group-hover`), not keyboard accessible — `frontend/src/components/common/Navbar.jsx:155-196`.
16. Icon buttons use `title` instead of `aria-label` — `frontend/src/components/products/ProductCard.jsx:49-74`.
17. Inconsistent currency formatting (`toLocaleString` vs `toFixed(2)`) — `frontend/src/pages/Admin/AdminDashboard.jsx:38,185`.
18. AddressForm useEffect only reacts to `existingAddress` reference change — `frontend/src/components/checkout/AddressForm.jsx:28-32`.

---

## Fix Order

1. Backend Critical (1–5)
2. Backend High (6–12)
3. Backend Medium/Low (13–21)
4. Frontend Critical (1–4)
5. Frontend High (5–8)
6. Frontend Medium (9–14)
7. Frontend Low (15–18)
