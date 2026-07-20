import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import { useToast } from "../components/common/ToastProvider";
import { useCart } from "../hooks/useCart";
import { formatCurrency, getErrorMessage, getStoredUser } from "../utils/helpers";

import carrotImage from "../assets/Carrot image.jpg";
import heroImage from "../assets/hero.png";
import potatoImage from "../assets/Potato.jpeg";
import tomatoImage from "../assets/Tomato.jpg";

const productImageMap = {
  carrot: carrotImage,
  carrots: carrotImage,
  potato: potatoImage,
  potatoes: potatoImage,
  tomato: tomatoImage,
  tomatoes: tomatoImage,
  tomoto: tomatoImage,
  tomotos: tomatoImage,
};

const getProductImage = (product) => {
  if (!product) return heroImage;
  const name = product.productName?.trim().toLowerCase();
  return productImageMap[name] || heroImage;
};

export default function Cart() {
  const { cart, loading, error, refreshCart, updateItem, removeItem, clearAll } = useCart();
  const user = getStoredUser();
  const { showError, showInfo, showSuccess } = useToast();

  const handleRefresh = async () => {
    try {
      await refreshCart();
      showInfo("Cart refreshed.");
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeItem(productId);
      showSuccess("Product removed from your cart.");
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const handleUpdateQty = async (productId, nextQty) => {
    if (!productId) return;
    try {
      if (nextQty <= 0) {
        await removeItem(productId);
        showSuccess("Product removed from your cart.");
      } else {
        await updateItem(productId, nextQty);
      }
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const handleClear = async () => {
    try {
      await clearAll();
      showSuccess("Cart cleared successfully.");
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  if (!user || user.role !== "consumer") {
    return (
      <div className="rounded-[2rem] bg-white/95 p-8 shadow-xl max-w-xl mx-auto text-center my-8">
        <span className="text-4xl">🛒</span>
        <h1 className="text-3xl font-bold text-slate-900 mt-4">Consumer Cart Only</h1>
        <p className="mt-2 text-slate-600">Please login as a consumer to view and manage your shopping cart.</p>
        <Link to="/login" className="mt-6 inline-block rounded-full bg-[#1f7a5c] px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-950/10 hover:-translate-y-0.5">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0d4f40_0%,#0f6e58_46%,#bf6c2f_100%)] p-8 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-200 font-semibold">Shopping Cart</p>
        <h1 className="mt-3 text-3xl font-bold">Review Your Produce</h1>
        <p className="mt-3 max-w-2xl text-sm text-emerald-50/90 leading-6">
          Adjust item quantities, review live prices, and proceed directly to coordination for your local pickup.
        </p>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Your Basket</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            className="bg-white !text-slate-800 border border-slate-200 hover:!bg-slate-50"
          >
            Refresh List
          </Button>
          {cart?.items?.length ? (
            <Button onClick={handleClear} className="bg-rose-50 !text-rose-700 border border-rose-100 hover:!bg-rose-100">
              Clear All
            </Button>
          ) : null}
        </div>
      </div>

      {loading ? <Loader label="Updating cart..." /> : null}
      {error ? <p className="rounded-2xl bg-rose-50 p-4 text-rose-700 border border-rose-100">{error}</p> : null}

      {!loading && cart?.items?.length ? (
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          {/* Left Column: Cart Items List */}
          <div className="space-y-4">
            {cart.items.map((item) => {
              const product = item.productId || {};
              const imageUrl = getProductImage(product);
              return (
                <div
                  key={product._id || item._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-lg transition hover:shadow-xl group"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={imageUrl}
                      alt={product.productName || "Product"}
                      className="h-16 w-16 rounded-xl object-cover border border-slate-100 shadow-inner group-hover:scale-105 transition"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">{product.productName || "Unknown Item"}</h3>
                      <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider">
                        {product.category || "Fresh"} | {formatCurrency(product.price || 0)} each
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(product._id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-semibold text-slate-900">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(product._id, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="font-bold text-slate-900 text-right min-w-[70px]">
                        {formatCurrency((product.price || 0) * item.quantity)}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemove(product._id)}
                        className="rounded-xl p-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                        aria-label="Remove item"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Totals Summary */}
          <div>
            <div className="rounded-[1.75rem] border border-white/60 bg-white/95 p-6 shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-bottom pb-2">Order Summary</h2>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Total Items</span>
                  <span className="font-semibold text-slate-800">{cart.totalItems} units</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 text-base">
                  <span className="font-bold text-slate-800">Total Amount</span>
                  <span className="font-extrabold text-emerald-800 text-lg">{formatCurrency(cart.totalAmount)}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/checkout"
                  className="block w-full text-center rounded-full bg-[linear-gradient(135deg,#1f7a5c_0%,#bf6c2f_100%)] py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:-translate-y-0.5 hover:shadow-emerald-950/20 active:translate-y-0"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {!loading && !cart?.items?.length ? (
        <div className="rounded-[1.75rem] border border-white/60 bg-white p-8 text-center shadow-lg max-w-lg mx-auto">
          <p className="text-slate-600">Your basket is currently empty.</p>
          <Link
            to="/products"
            className="mt-5 inline-block rounded-full bg-[#1f7a5c] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:-translate-y-0.5"
          >
            Explore Fresh Products
          </Link>
        </div>
      ) : null}
    </div>
  );
}
