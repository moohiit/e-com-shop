// Single source of truth for cart/checkout pricing math.
// Mirrors backend Product virtuals & shipping rule (orderController.computeShipping).
// Whenever you change one of these formulas, update the matching backend code too.

export const FREE_SHIPPING_THRESHOLD = 500;
export const FLAT_SHIPPING_FEE = 50;

const round2 = (n) => Number((n || 0).toFixed(2));

// Per-unit numbers from a cart item (which mirrors a Product document).
const perUnit = (item) => {
  const basePrice = Number(item.basePrice) || 0;
  const discountPercentage = Number(item.discountPercentage) || 0;
  const taxPercentage = Number(item.taxPercentage) || 0;

  // discountAmount and taxAmount may already be present (from server). Prefer them
  // if defined; otherwise derive them so cart still works for legacy items.
  const discountAmount =
    item.discountAmount != null
      ? Number(item.discountAmount)
      : (basePrice * discountPercentage) / 100;

  const discounted = basePrice - discountAmount;

  const taxAmount =
    item.taxAmount != null
      ? Number(item.taxAmount)
      : (discounted * taxPercentage) / 100;

  const finalPrice =
    item.finalPrice != null
      ? Number(item.finalPrice)
      : discounted + taxAmount;

  return { basePrice, discountAmount, taxAmount, finalPrice };
};

export const computeShipping = (itemsTotalAfterTax) =>
  itemsTotalAfterTax > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;

export const calculateCartPricing = (cartItems = []) => {
  let itemsPrice = 0;
  let totalDiscount = 0;
  let taxPrice = 0;
  let itemsTotal = 0;

  for (const item of cartItems) {
    const { basePrice, discountAmount, taxAmount, finalPrice } = perUnit(item);
    const qty = Number(item.quantity) || 0;
    itemsPrice += basePrice * qty;
    totalDiscount += discountAmount * qty;
    taxPrice += taxAmount * qty;
    itemsTotal += finalPrice * qty;
  }

  const shippingPrice = computeShipping(itemsTotal);
  const totalPrice = round2(itemsTotal + shippingPrice);

  return {
    itemsPrice: round2(itemsPrice),
    totalDiscount: round2(totalDiscount),
    taxPrice: round2(taxPrice),
    shippingPrice,
    totalPrice,
  };
};

// Per-line numbers, used by cart/review rendering.
export const calculateLinePricing = (item) => {
  const { basePrice, discountAmount, taxAmount, finalPrice } = perUnit(item);
  const qty = Number(item.quantity) || 0;
  return {
    basePriceLine: round2(basePrice * qty),
    discountAmountLine: round2(discountAmount * qty),
    taxAmountLine: round2(taxAmount * qty),
    itemTotal: round2(finalPrice * qty),
  };
};
