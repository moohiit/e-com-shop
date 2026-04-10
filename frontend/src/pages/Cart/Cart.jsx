import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  selectCartItems,
  selectCartTotalQuantity,
  addItem,
  removeItem,
  deleteItem,
  clearCart,
  setCartFromServer,
} from "../../features/cart/cartSlice";
import { addToWishlist } from "../../features/wishlist/wishlistSlice";
import { useAddToWishlistApiMutation } from "../../features/wishlist/wishlistApiSlice";
import {
  useGetCartQuery,
  useSyncCartMutation,
  useRemoveFromCartApiMutation,
  useClearCartApiMutation,
} from "../../features/cart/cartApiSlice";
import { toast } from "react-hot-toast";
import {
  calculateCartPricing,
  calculateLinePricing,
  FREE_SHIPPING_THRESHOLD,
  FLAT_SHIPPING_FEE,
} from "../../utils/pricing";
import {
  Minus,
  Plus,
  Trash2,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Tag,
  ChevronRight,
  AlertTriangle,
  Package,
} from "lucide-react";

function Cart() {
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector(selectCartItems);
  const totalQuantity = useSelector(selectCartTotalQuantity);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: serverCart } = useGetCartQuery(undefined, { skip: !user });
  const [syncCart] = useSyncCartMutation();
  const [removeFromCartApi] = useRemoveFromCartApiMutation();
  const [clearCartApi] = useClearCartApiMutation();
  const [addToWishlistApi] = useAddToWishlistApiMutation();

  useEffect(() => {
    if (user && serverCart?.items) {
      if (cartItems.length > 0 && serverCart.items.length === 0) {
        const items = cartItems.map((i) => ({
          product: i._id,
          quantity: i.quantity,
        }));
        syncCart(items).catch(() => {});
      } else if (serverCart.items.length > 0) {
        dispatch(setCartFromServer(serverCart.items));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverCart, user]);

  const handleIncrease = (item) => {
    if (item.quantity >= (item.stock || 99)) {
      toast.error(`Only ${item.stock} items available`);
      return;
    }
    dispatch(addItem(item));
  };

  const handleDecrease = (item) => {
    if (item.quantity === 1) {
      dispatch(deleteItem(item._id));
      toast.success("Item removed");
    } else {
      dispatch(removeItem(item._id));
    }
  };

  const handleRemove = (id) => {
    dispatch(deleteItem(id));
    if (user) removeFromCartApi(id).catch(() => {});
    toast.success("Item removed");
  };

  const handleMoveToWishlist = (item) => {
    dispatch(deleteItem(item._id));
    dispatch(addToWishlist(item));
    if (user) {
      removeFromCartApi(item._id).catch(() => {});
      addToWishlistApi(item._id).catch(() => {});
    }
    toast.success("Moved to wishlist");
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    if (user) clearCartApi().catch(() => {});
    toast.success("Cart cleared");
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return toast.error("Your cart is empty");
    navigate("/checkout");
  };

  const { itemsPrice, taxPrice, totalDiscount, shippingPrice, totalPrice } =
    calculateCartPricing(cartItems);

  const amountUntilFreeShipping =
    shippingPrice > 0 ? FREE_SHIPPING_THRESHOLD - (itemsPrice - totalDiscount + taxPrice) : 0;
  const freeShippingProgress =
    shippingPrice > 0
      ? Math.min(
          100,
          (((itemsPrice - totalDiscount + taxPrice) / FREE_SHIPPING_THRESHOLD) * 100)
        )
      : 100;

  // -- Empty state --
  if (cartItems.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-950 min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <ShoppingBag size={40} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <ShoppingBag size={18} />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Shopping Cart
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {totalQuantity} item{totalQuantity !== 1 ? "s" : ""} in your cart
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearCart}
            className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
          >
            Clear cart
          </button>
        </div>

        {/* Free shipping progress bar */}
        {shippingPrice > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Truck size={18} className="text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Add{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  ₹{amountUntilFreeShipping.toFixed(0)}
                </span>{" "}
                more for <strong>free delivery!</strong>
              </p>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
              const {
                basePriceLine: basePrice,
                discountAmountLine: discountAmount,
                taxAmountLine: taxAmount,
                itemTotal,
              } = calculateLinePricing(item);
              const unitFinal = Number(item.finalPrice ?? item.basePrice ?? 0);
              const hasDiscount = (item.discountPercentage || 0) > 0;

              return (
                <div
                  key={item._id}
                  className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-5"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link
                      to={`/product/${item._id}`}
                      className="shrink-0"
                    >
                      <img
                        src={item.images?.[0]?.imageUrl || "/placeholder-image.jpg"}
                        alt={item.name}
                        className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover border border-gray-100 dark:border-gray-800"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {item.brand && (
                            <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                              {item.brand}
                            </p>
                          )}
                          <Link
                            to={`/product/${item._id}`}
                            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>
                        </div>

                        {/* Line total — desktop */}
                        <p className="hidden sm:block text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          ₹{itemTotal.toFixed(2)}
                        </p>
                      </div>

                      {/* Price per unit */}
                      <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          ₹{unitFinal.toFixed(2)}
                        </span>
                        {hasDiscount && (
                          <>
                            <span className="text-xs text-gray-400 line-through">
                              ₹{(item.basePrice || 0).toFixed(2)}
                            </span>
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                              {Math.round(item.discountPercentage)}% off
                            </span>
                          </>
                        )}
                      </div>

                      {/* Stock badge */}
                      <div className="mt-1">
                        {item.stock > 0 ? (
                          item.stock <= 5 ? (
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                              <AlertTriangle size={12} /> Only {item.stock} left
                            </p>
                          ) : null
                        ) : (
                          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                            Out of stock
                          </p>
                        )}
                      </div>

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Bottom row: qty + actions */}
                      <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                        {/* Quantity stepper */}
                        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleDecrease(item)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 py-1.5 text-sm font-semibold min-w-[2.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncrease(item)}
                            disabled={item.quantity >= (item.stock || 99)}
                            aria-label="Increase quantity"
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleMoveToWishlist(item)}
                            aria-label="Move to wishlist"
                            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          >
                            <Heart size={14} /> Save
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemove(item._id)}
                            aria-label="Remove item"
                            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>

                        {/* Line total — mobile */}
                        <p className="sm:hidden text-base font-bold text-gray-900 dark:text-white">
                          ₹{itemTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary — sticky on desktop */}
          <aside className="lg:col-span-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 md:p-6 lg:sticky lg:top-4 space-y-5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal ({totalQuantity} items)
                  </span>
                  <span className="font-medium">₹{itemsPrice.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1">
                      <Tag size={13} /> Discount
                    </span>
                    <span className="font-medium">
                      −₹{totalDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="font-medium">₹{taxPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Delivery
                  </span>
                  <span
                    className={`font-medium ${
                      shippingPrice === 0
                        ? "text-green-600 dark:text-green-400"
                        : ""
                    }`}
                  >
                    {shippingPrice === 0
                      ? "FREE"
                      : `₹${shippingPrice.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                {totalDiscount > 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 text-right mt-1">
                    You're saving ₹{totalDiscount.toFixed(2)} on this order!
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Proceed to Checkout
                <ChevronRight size={16} />
              </button>

              <Link
                to="/products"
                className="w-full inline-flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                <ShoppingBag size={14} />
                Continue Shopping
              </Link>

              {/* Trust badges */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 grid grid-cols-2 gap-3">
                {[
                  { icon: Truck, label: "Free delivery 500+" },
                  { icon: ShieldCheck, label: "Secure checkout" },
                  { icon: Package, label: "Easy returns" },
                  { icon: Tag, label: "Best prices" },
                ].map((b) => {
                  const Icon = b.icon;
                  return (
                    <div
                      key={b.label}
                      className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400"
                    >
                      <Icon size={14} className="shrink-0" />
                      <span>{b.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Cart;
